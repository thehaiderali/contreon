import React from 'react';
import { useNavigate } from 'react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, FolderOpen, FileText, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

const CollectionCard = ({ 
  id,
  title, 
  description, 
  posts = [],
  postCount,
  publishedPostCount,
  createdAt,
  onDelete 
}) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleEdit = () => {
    navigate(`/creator/collections/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This will remove the collection but NOT delete the posts.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await api.delete(`/collections/${id}`);
      onDelete?.(id);
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert('Failed to delete collection');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPosts = postCount || posts.length;
  const publishedCount = publishedPostCount || posts.filter(p => p.isPublished).length;

  return (
    <Card className="w-full bg-card border-border shadow-sm hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-0 pt-1">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FolderOpen className="h-5 w-5 text-muted-foreground shrink-0" />
            <CardTitle className="text-lg break-all">{title}</CardTitle>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button 
              onClick={handleEdit} 
              variant="ghost" 
              size="icon-sm"
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              onClick={handleDelete} 
              variant="ghost" 
              size="icon-sm"
              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {description && (
          <CardDescription className="text-sm mt-1 break-all whitespace-normal">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="pb-1 pt-0">
        <div className="flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>{totalPosts} posts</span>
          </div>
          {publishedCount < totalPosts && (
            <Badge variant="secondary" className="text-xs">
              {publishedCount} published
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 pb-1 flex justify-between items-center gap-4 border-t">
        <div className="text-xs text-muted-foreground">
          Created {new Date(createdAt).toLocaleDateString()}
        </div>
        <Button 
          onClick={handleEdit} 
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <Edit className="h-3.5 w-3.5" />
          Manage Posts
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CollectionCard;