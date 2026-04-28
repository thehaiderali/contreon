import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { MessageCircle, Send, Trash2, Loader2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/authStore';

export default function Comments({ postId, creatorUrl, commentsAllowed }) {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState(null);
  const {user}=useAuthStore();
  const [editing,setEditing]=useState(false);
  const [editId,setEditId]=useState("")

  // If user._id === comment.authorId // Show an Edit Button on Comment. 
  // The api request is as Follows  . 
  // const res=await api.put("/comments/${comment._id}",{ content:newContent   }  )

  useEffect(() => {
    if (commentsAllowed) {
      fetchComments();
    }
  }, [postId, creatorUrl, commentsAllowed,]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/comments/post/${postId}`);
      if (res.data.success) {
        console.log(res.data.data.comments)
        setComments(res.data.data.comments || []);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if(!editing){
         try {
      setIsSubmitting(true);
      const res = await api.post(`/content/comments/${postId}`, {
        content: newComment.trim(),
      });

      if (res.data.success) {
        setComments((prev) => [res.data.data.comment, ...prev]);
        setNewComment('');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
    }
    else{

       const res=await api.put(`/comments/${editId}`,{
        content:newComment
      });
      console.log(res)
      setIsSubmitting(false);
      setEditing(false);
      setEditId("")
      setNewComment("")
      fetchComments()

    }
 
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${postId}/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete comment');
    }

  };

    const handleUpdateComment = async (commentId) => {
      const comment=comments.filter((com)=>com._id===commentId)[0]
      console.log("Comment: ",comment)
      setNewComment(comment.content)
      setEditId(commentId)
      setEditing(true)
    
  };

  if (!commentsAllowed) {
    return null;
  }

  return (
    <div className="mt-8 pt-6 border-t border-border">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="h-5 w-5" />
        <h3 className="text-lg font-semibold">
          Comments {comments.length > 0 && `(${comments.length})`}
        </h3>
      </div>

      <form onSubmit={handleSubmitComment} className="mb-8">
        <div className="flex gap-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="min-h-[80px] resize-none"
            disabled={isSubmitting}
          />
        </div>
        <div className="mt-2 flex justify-end">
          <Button type="submit" disabled={isSubmitting || !newComment.trim()} className="gap-2">
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {editing  ? "Update Comment" : "Post Comment"}
          </Button>
        </div>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </form>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No comments yet. Be the first to comment!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment._id} className="bg-muted/50 p-4 rounded-lg">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm">
                      {comment.authorId?.fullName }
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                    {comment.featured && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-red-500"
                  onClick={() => handleDeleteComment(comment._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-yellow-500"
                  onClick={() => handleUpdateComment(comment._id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}