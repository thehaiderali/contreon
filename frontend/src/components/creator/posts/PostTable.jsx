import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { api } from "@/lib/api";

export default function MyPostsPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [status, setStatus] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const params = { page: pagination.page };
        if (status !== "all") params.status = status;
        const response = await api.get("creators/posts/my-posts", { params });
        setPosts(response.data.data);
        setPagination(response.data.pagination);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [pagination.page, status]);

  const handleDelete = async () => {
    if (!postToDelete) return;
    try {
      setIsDeleting(true);
      await api.delete(`/creators/posts/${postToDelete}`);
      const params = { page: pagination.page };
      if (status !== "all") params.status = status;
      const response = await api.get("creators/posts/my-posts", { params });
      setPosts(response.data.data);
      setPagination(response.data.pagination);
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteClick = (postId) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const getPostTitle = () => posts.find((p) => p._id === postToDelete)?.title || "this post";

  const rowVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: (i) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.04, duration: 0.2, ease: "easeOut" },
    }),
  };

  return (
    <>
      <Card className="w-full">
        {/* ── Header ── */}
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
          <CardTitle className="text-lg md:text-xl shrink-0">My Posts</CardTitle>

          <Tabs value={status} onValueChange={handleStatusChange} className="w-full sm:w-auto">
            <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:flex">
              {["all", "published", "draft"].map((tab) => (
                <TabsTrigger key={tab} value={tab} className="capitalize cursor-pointer">
                  {tab === "all" ? "All" : tab === "published" ? "Published" : "Drafts"}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="px-3 sm:px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {loading ? (
                <div className="flex justify-center py-12 text-muted-foreground text-sm">
                  Loading...
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No posts found
                </div>
              ) : (
                <>
                  {/* ── Desktop Table ── */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40%]">Title</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {posts.map((post, i) => (
                          <motion.tr
                            key={post._id}
                            custom={i}
                            variants={rowVariants}
                            initial="hidden"
                            animate="visible"
                            className="border-b transition-colors hover:bg-muted/40"
                          >
                            <TableCell className="font-medium max-w-[240px] truncate">
                              {post.title}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">{post.type}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={post.isPublished ? "default" : "secondary"}>
                                {post.isPublished ? "Published" : "Draft"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="outline"
                                  onClick={() => navigate(`/creator/posts/${post.type}/${post._id}/edit`)}>
                                  Edit
                                </Button>
                                <Button size="sm" variant="destructive"
                                  onClick={() => handleDeleteClick(post._id)}>
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* ── Mobile Cards ── */}
                  <div className="md:hidden space-y-3">
                    {posts.map((post, i) => (
                      <motion.div
                        key={post._id}
                        custom={i}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        className="border rounded-lg p-4 space-y-3 bg-card"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm leading-snug line-clamp-2">
                              {post.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <Badge variant="outline" className="text-xs capitalize">{post.type}</Badge>
                            <Badge variant={post.isPublished ? "default" : "secondary"} className="text-xs">
                              {post.isPublished ? "Published" : "Draft"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <Button size="sm" variant="outline" className="flex-1 h-8 text-xs"
                            onClick={() => navigate(`/creator/posts/${post.type}/${post._id}/edit`)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" className="h-8 text-xs px-4"
                            onClick={() => handleDeleteClick(post._id)}>
                            Delete
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* ── Pagination ── */}
          {pagination.pages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent className="flex-wrap gap-1">
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => { e.preventDefault(); if (pagination.page > 1) handlePageChange(pagination.page - 1); }}
                    className={pagination.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {[...Array(pagination.pages)].map((_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink
                      href="#"
                      isActive={pagination.page === i + 1}
                      onClick={(e) => { e.preventDefault(); handlePageChange(i + 1); }}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => { e.preventDefault(); if (pagination.page < pagination.pages) handlePageChange(pagination.page + 1); }}
                    className={pagination.page >= pagination.pages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>

      {/* ── Delete Dialog ── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <span className="font-medium text-foreground">"{getPostTitle()}"</span>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="min-w-[80px]">
                {isDeleting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : "Delete"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}