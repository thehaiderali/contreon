import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";

export default function MyPostsPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [status, setStatus] = useState("all");

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const params = {};
        if (pagination.page) params.page = pagination.page;
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

  // Delete post
  const handleDelete = async (postId) => {
    try {
      await api.delete(`/creators/posts/${postId}`);
      const response = await api.get("creators/posts/my-posts", {
        params: { page: pagination.page, status: status !== "all" ? status : undefined },
      });
      setPosts(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Animation variants
  const tableVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.03,
        duration: 0.2,
        ease: "easeOut"
      }
    })
  };

  const badgeVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 }
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center p-8"
      >
        Loading...
      </motion.div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Posts</CardTitle>
        <Tabs 
          defaultValue="all" 
          value={status}
          onValueChange={handleStatusChange}
          className="w-[400px]"
        >
          <TabsList>
            <TabsTrigger 
              value="all" 
              className="cursor-pointer relative"
            >
              All
              {status === "all" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="published" 
              className="cursor-pointer relative"
            >
              Published
              {status === "published" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="draft" 
              className="cursor-pointer relative"
            >
              Drafts
              {status === "draft" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={status}
            variants={tableVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.length === 0 ? (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TableCell colSpan={5} className="text-center">
                      No posts found
                    </TableCell>
                  </motion.tr>
                ) : (
                  posts.map((post, index) => (
                    <motion.tr
                      key={post._id}
                      custom={index}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ 
                        backgroundColor: "rgba(0,0,0,0.02)",
                        transition: { duration: 0.1 }
                      }}
                    >
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell>
                        <motion.div
                          variants={badgeVariants}
                          initial="initial"
                          animate="animate"
                          whileHover="whileHover"
                          whileTap="whileTap"
                        >
                          <Badge variant="outline">{post.type}</Badge>
                        </motion.div>
                      </TableCell>
                      <TableCell>
                        <motion.div
                          variants={badgeVariants}
                          initial="initial"
                          animate="animate"
                          whileHover="whileHover"
                        >
                          <Badge variant={post.isPublished ? "default" : "secondary"}>
                            {post.isPublished ? "Published" : "Draft"}
                          </Badge>
                        </motion.div>
                      </TableCell>
                      <TableCell>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                navigate(`/creator/posts/${post.type}/${post._id}/edit`)
                              }
                            >
                              Edit
                            </Button>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(post._id)}
                            >
                              Delete
                            </Button>
                          </motion.div>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </motion.div>
        </AnimatePresence>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (pagination.page > 1)
                          handlePageChange(pagination.page - 1);
                      }}
                      className="cursor-pointer"
                    />
                  </motion.div>
                </PaginationItem>
                {[...Array(pagination.pages)].map((_, i) => (
                  <PaginationItem key={i + 1}>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <PaginationLink
                        href="#"
                        isActive={pagination.page === i + 1}
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(i + 1);
                        }}
                        className="cursor-pointer"
                      >
                        {i + 1}
                      </PaginationLink>
                    </motion.div>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (pagination.page < pagination.pages)
                          handlePageChange(pagination.page + 1);
                      }}
                      className="cursor-pointer"
                    />
                  </motion.div>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}