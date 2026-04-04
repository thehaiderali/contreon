import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Plus, X, FileText } from 'lucide-react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';

const CollectionEditForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    posts: [],
  });

  const [allPosts, setAllPosts] = useState([]);
  const [availablePosts, setAvailablePosts] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResponse, setSubmitResponse] = useState(null);
  const [showPostSelector, setShowPostSelector] = useState(false);

  // Fetch collection data and available posts
  useEffect(() => {
    fetchCollectionData();
    fetchAvailablePosts();
  }, [id]);

  const fetchCollectionData = async () => {
    try {
      const response = await api.get(`/collections/${id}`);
      console.log("Fetched collection:", response);
      
      if (response.data.success) {
        const collection = response.data.data.collection;
        setFormData({
          title: collection.title || '',
          description: collection.description || '',
          posts: collection.posts || [],
        });
      } else {
        setSubmitResponse({
          type: 'error',
          message: 'Failed to load collection data',
        });
      }
    } catch (error) {
      console.error("Error fetching collection:", error);
      setSubmitResponse({
        type: 'error',
        message: error.response?.data?.error || 'An error occurred while loading the collection',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailablePosts = async () => {
    try {
      // Fetch all posts for this creator
      const response = await api.get('/posts/my');
      if (response.data.success) {
        const posts = response.data.data.posts;
        setAllPosts(posts);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  // Update available posts (posts not already in collection)
  useEffect(() => {
    if (allPosts.length > 0 && formData.posts.length >= 0) {
      const collectionPostIds = formData.posts.map(p => p._id || p);
      const available = allPosts.filter(post => !collectionPostIds.includes(post._id));
      setAvailablePosts(available);
    }
  }, [allPosts, formData.posts]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Collection title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 30) {
      newErrors.title = 'Title must be less than 30 characters';
    }

    if (formData.description && formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description && formData.description.length > 100) {
      newErrors.description = 'Description must be less than 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const addPostToCollection = async (postId) => {
    try {
      const response = await api.post(`/collections/${id}/posts/${postId}`);
      if (response.data.success) {
        // Refresh collection data
        await fetchCollectionData();
        setShowPostSelector(false);
        setSubmitResponse({
          type: 'success',
          message: 'Post added to collection!',
        });
        setTimeout(() => setSubmitResponse(null), 3000);
      }
    } catch (error) {
      console.error("Error adding post:", error);
      setSubmitResponse({
        type: 'error',
        message: error.response?.data?.error || 'Failed to add post',
      });
    }
  };

  const removePostFromCollection = async (postId) => {
    if (!confirm('Remove this post from the collection?')) return;
    
    try {
      const response = await api.delete(`/collections/${id}/posts/${postId}`);
      if (response.data.success) {
        await fetchCollectionData();
        setSubmitResponse({
          type: 'success',
          message: 'Post removed from collection',
        });
        setTimeout(() => setSubmitResponse(null), 3000);
      }
    } catch (error) {
      console.error("Error removing post:", error);
      setSubmitResponse({
        type: 'error',
        message: error.response?.data?.error || 'Failed to remove post',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitResponse(null);

    const submissionData = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
    };

    try {
      const response = await api.put(`/collections/${id}`, submissionData);
      console.log("Update response:", response);

      if (response.data.success) {
        setSubmitResponse({
          type: 'success',
          message: 'Collection updated successfully!',
        });
        
        setTimeout(() => {
          navigate('/creator/collections');
        }, 1500);
      } else {
        setSubmitResponse({
          type: 'error',
          message: response.data.error || 'Failed to update collection',
        });
      }
    } catch (error) {
      console.error("Error updating collection:", error);
      setSubmitResponse({
        type: 'error',
        message: error.response?.data?.error || 'An error occurred while updating the collection',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this collection? This will NOT delete the posts inside it.`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.delete(`/collections/${id}`);
      
      if (response.data.success) {
        setSubmitResponse({
          type: 'success',
          message: 'Collection deleted successfully!',
        });
        
        setTimeout(() => {
          navigate('/creator/collections');
        }, 1500);
      } else {
        setSubmitResponse({
          type: 'error',
          message: 'Failed to delete collection',
        });
      }
    } catch (error) {
      console.error("Error deleting collection:", error);
      setSubmitResponse({
        type: 'error',
        message: error.response?.data?.error || 'An error occurred while deleting',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Button
        variant="ghost"
        onClick={() => navigate('/creator/collections')}
        className="mb-4 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Collections
      </Button>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Edit Collection</CardTitle>
            <CardDescription>
              Update your collection details
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {submitResponse && submitResponse.type !== 'success' && (
                <Alert variant="destructive">
                  <AlertDescription>{submitResponse.message}</AlertDescription>
                </Alert>
              )}

              {submitResponse && submitResponse.type === 'success' && (
                <Alert>
                  <AlertDescription className="text-green-600">
                    {submitResponse.message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">
                  Collection Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
                <div className="flex justify-end">
                  <p className="text-xs text-muted-foreground">
                    {formData.description.length}/100
                  </p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between gap-2">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                Delete Collection
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/creator/collections')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Collection'}
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Posts Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Posts in Collection</span>
              <Button 
                size="sm" 
                onClick={() => setShowPostSelector(!showPostSelector)}
                disabled={availablePosts.length === 0}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Post
              </Button>
            </CardTitle>
            <CardDescription>
              {formData.posts.length} post{formData.posts.length !== 1 ? 's' : ''} in this collection
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {showPostSelector && availablePosts.length > 0 && (
              <div className="mb-4 p-3 border rounded-lg bg-muted/30">
                <Label className="text-sm font-medium mb-2 block">Add a post:</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availablePosts.map((post) => (
                    <div 
                      key={post._id}
                      className="flex justify-between items-center p-2 hover:bg-muted rounded cursor-pointer"
                      onClick={() => addPostToCollection(post._id)}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{post.title}</span>
                      </div>
                      <Badge variant={post.isPublished ? "default" : "secondary"}>
                        {post.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-100 overflow-y-auto">
              {formData.posts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No posts in this collection yet</p>
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={() => setShowPostSelector(true)}
                    className="mt-2"
                  >
                    Add your first post
                  </Button>
                </div>
              ) : (
                formData.posts.map((post) => {
                  const postData = post._id ? post : allPosts.find(p => p._id === post);
                  return (
                    <div 
                      key={postData?._id || post} 
                      className="flex justify-between items-center p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{postData?.title || 'Untitled'}</span>
                        </div>
                        {postData?.isPublished === false && (
                          <Badge variant="secondary" className="text-xs mt-1">Draft</Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removePostFromCollection(postData?._id || post)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CollectionEditForm;