import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  BookOpen,
  Plus,
  Pin,
  Trash2,
  ExternalLink,
  Search,
  Loader2,
} from "lucide-react";
import { db } from "@/integrations/firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";

type ResourceType = "video" | "simulation" | "article" | "link" | "document";

interface Resource {
  id: string;
  userId: string;
  title: string;
  description: string;
  resourceType: ResourceType;
  url: string;
  tags: string[];
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TYPES: { value: ResourceType; label: string }[] = [
  { value: "video", label: "Video" },
  { value: "simulation", label: "Simulation" },
  { value: "article", label: "Article" },
  { value: "document", label: "Document" },
  { value: "link", label: "Link" },
];

const isEmbeddable = (url: string) =>
  /youtube\.com|youtu\.be|vimeo\.com|phet\.colorado\.edu|sketchfab\.com/.test(
    url
  );

const getEmbedUrl = (url: string) => {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([/w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return url;
};

export default function BookPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    description: "",
    url: "",
    resourceType: "link" as ResourceType,
    tags: "",
  });

  useEffect(() => {
    if (!user) return;
    loadResources();
  }, [user]);

  const loadResources = async () => {
    try {
      setLoading(true);
      const resourcesRef = collection(db, "book_resources");
      const q = query(resourcesRef, where("userId", "==", user!.uid));
      const snapshot = await getDocs(q);
      const resourcesList: Resource[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        userId: doc.data().userId,
        title: doc.data().title,
        description: doc.data().description,
        resourceType: doc.data().resourceType,
        url: doc.data().url,
        tags: doc.data().tags || [],
        isPinned: doc.data().isPinned || false,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      }));

      resourcesList.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

      setResources(resourcesList);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load resources:", error);
      toast.error("Failed to load resources");
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return resources.filter(
      (r) =>
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [resources, search]);

  const createResource = async () => {
    if (!user || !form.url.trim()) {
      toast.error("URL is required");
      return;
    }

    try {
      const resourceRef = collection(db, "book_resources");
      const docRef = await addDoc(resourceRef, {
        userId: user.uid,
        title: form.title || "Untitled Resource",
        description: form.description,
        url: form.url,
        resourceType: form.resourceType,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        isPinned: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      const newResource: Resource = {
        id: docRef.id,
        userId: user.uid,
        title: form.title || "Untitled Resource",
        description: form.description,
        url: form.url,
        resourceType: form.resourceType,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        isPinned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setResources((p) => [newResource, ...p]);
      setOpen(false);
      setForm({
        title: "",
        description: "",
        url: "",
        resourceType: "link",
        tags: "",
      });
      toast.success("Resource created");
    } catch (error) {
      console.error("Failed to create resource:", error);
      toast.error("Failed to create resource");
    }
  };

  const togglePin = async (resource: Resource) => {
    try {
      const docRef = doc(db, "book_resources", resource.id);
      await updateDoc(docRef, { isPinned: !resource.isPinned });
      setResources((p) =>
        p
          .map((x) =>
            x.id === resource.id ? { ...x, isPinned: !x.isPinned } : x
          )
          .sort((a, b) => {
            if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
            return b.createdAt.getTime() - a.createdAt.getTime();
          })
      );
      toast.success(
        !resource.isPinned ? "Resource pinned" : "Resource unpinned"
      );
    } catch (error) {
      toast.error("Failed to update resource");
      console.error(error);
    }
  };

  const deleteResource = async (id: string) => {
    try {
      const docRef = doc(db, "book_resources", id);
      await deleteDoc(docRef);
      setResources((p) => p.filter((x) => x.id !== id));
      setPreview(null);
      toast.success("Resource deleted");
    } catch (error) {
      toast.error("Failed to delete resource");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading resources…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-foreground flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            Learning Resources
          </h1>
          <p className="text-muted-foreground mt-1">
            Curate and organize videos, simulations, articles, and more.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Learning Resource</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="Resource title"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="What is this resource about?"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Resource Type</Label>
                <Select
                  value={form.resourceType}
                  onValueChange={(value) =>
                    setForm({ ...form, resourceType: value as ResourceType })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>URL</Label>
                <Input
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://example.com"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="math, algebra, chapter-1"
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createResource}>Create Resource</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search resources by title, description, or tag…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {filtered.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground">
              {resources.length === 0
                ? "No resources yet. Create your first learning resource."
                : "No resources matched your search."}
            </Card>
          ) : (
            filtered.map((resource) => (
              <Card
                key={resource.id}
                className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setPreview(resource)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground truncate">
                        {resource.title}
                      </h3>
                      {resource.isPinned && (
                        <Pin className="h-4 w-4 text-accent flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {resource.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="outline">{resource.resourceType}</Badge>
                      {resource.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Added {resource.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePin(resource);
                    }}
                  >
                    <Pin
                      className={`h-4 w-4 ${resource.isPinned
                        ? "fill-current"
                        : "text-muted-foreground"
                      }`}
                    />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {preview && (
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <div className="space-y-4">
                <div>
                  <h2 className="font-semibold text-foreground">
                    {preview.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    {preview.description}
                  </p>
                </div>

                {isEmbeddable(preview.url) ? (
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <iframe
                      src={getEmbedUrl(preview.url)}
                      className="w-full h-full"
                      allowFullScreen
                      title={preview.title}
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <ExternalLink className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {preview.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="space-y-2 pt-4 border-t border-border">
                  <Button
                    className="w-full"
                    variant="default"
                    asChild
                  >
                    <a
                      href={preview.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Resource
                    </a>
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => togglePin(preview)}
                  >
                    <Pin className="h-4 w-4 mr-2" />
                    {preview.isPinned ? "Unpin" : "Pin"}
                  </Button>
                  <Button
                    className="w-full"
                    variant="destructive"
                    onClick={() => deleteResource(preview.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Added {preview.createdAt.toLocaleDateString()}
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
