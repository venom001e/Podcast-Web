import { useEffect, useState } from "react";
import { useNavigate } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";

interface Podcast {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  audioUrl: string;
  category: string;
  isPremium: boolean;
  createdAt: string;
}

export default function AdminPodcasts() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [navigate] = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnail: "",
    audioUrl: "",
    category: "",
    isPremium: false,
  });

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const fetchPodcasts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/podcasts");
      
      if (response.status === 403) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      if (!response.ok) throw new Error("Failed to fetch podcasts");
      const data = await response.json();
      setPodcasts(data);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load podcasts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (podcast: Podcast) => {
    setFormData({
      title: podcast.title,
      description: podcast.description,
      thumbnail: podcast.thumbnail,
      audioUrl: podcast.audioUrl,
      category: podcast.category,
      isPremium: podcast.isPremium,
    });
    setEditingId(podcast.id);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Title and description are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `/api/admin/podcasts/${editingId}`
        : "/api/podcasts";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save podcast");

      toast({
        title: "Success",
        description: editingId ? "Podcast updated" : "Podcast created",
      });

      setIsDialogOpen(false);
      setEditingId(null);
      setFormData({
        title: "",
        description: "",
        thumbnail: "",
        audioUrl: "",
        category: "",
        isPremium: false,
      });
      fetchPodcasts();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save podcast",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/admin/podcasts/${deleteId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete podcast");

      toast({
        title: "Success",
        description: "Podcast deleted",
      });

      setDeleteId(null);
      fetchPodcasts();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete podcast",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/admin")}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Podcasts</h1>
          <p className="text-muted-foreground mt-2">Add, edit, or delete podcasts</p>
        </div>
        <Button onClick={() => {
          setEditingId(null);
          setFormData({
            title: "",
            description: "",
            thumbnail: "",
            audioUrl: "",
            category: "",
            isPremium: false,
          });
          setIsDialogOpen(true);
        }}>
          Add Podcast
        </Button>
      </div>

      <div className="space-y-4">
        {podcasts.map((podcast) => (
          <Card key={podcast.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 flex-1">
                  {podcast.thumbnail && (
                    <img
                      src={podcast.thumbnail}
                      alt={podcast.title}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{podcast.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {podcast.description}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs bg-secondary px-2 py-1 rounded">
                        {podcast.category}
                      </span>
                      {podcast.isPremium && (
                        <span className="text-xs bg-amber-500/20 text-amber-700 px-2 py-1 rounded">
                          Premium
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(podcast)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteId(podcast.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Podcast" : "Add New Podcast"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to {editingId ? "update" : "create"} a podcast
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Podcast title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Podcast description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="e.g., Business"
                />
              </div>
              <div>
                <Label htmlFor="thumbnail">Thumbnail URL</Label>
                <Input
                  id="thumbnail"
                  value={formData.thumbnail}
                  onChange={(e) =>
                    setFormData({ ...formData, thumbnail: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="audioUrl">Audio URL</Label>
              <Input
                id="audioUrl"
                value={formData.audioUrl}
                onChange={(e) =>
                  setFormData({ ...formData, audioUrl: e.target.value })
                }
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isPremium}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPremium: checked })
                }
              />
              <Label>Mark as Premium</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Podcast</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this podcast? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
