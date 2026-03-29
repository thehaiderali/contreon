import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PostCreate = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Attachments
  const [attachment, setAttachment] = useState("");
  const [attachments, setAttachments] = useState([]);

  // Tags
  const [tag, setTag] = useState("");
  const [tags, setTags] = useState([]);

  const addAttachment = () => {
    if (!attachment.trim()) return;
    setAttachments([...attachments, attachment]);
    setAttachment("");
  };

  const addTag = () => {
    if (!tag.trim()) return;
    setTags([...tags, tag]);
    setTag("");
  };

  const removeTag = (t) => {
    setTags(tags.filter((x) => x !== t));
  };

  return (
    <Card className="max-w-2xl mx-auto mt-10 p-4">
      <CardHeader>
        <CardTitle>Create a Post</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        
        {/* Title */}
        <div>
          <Label>Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title..."
          />
        </div>

        {/* Content */}
        <div>
          <Label>Content</Label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write something..."
            rows={6}
          />
        </div>

        {/* Attachment Links */}
        <div>
          <Label>Attachment Links</Label>
          <div className="flex gap-2 mt-2">
            <Input
              value={attachment}
              onChange={(e) => setAttachment(e.target.value)}
              placeholder="https://example.com/file"
            />
            <Button onClick={addAttachment}>Add</Button>
          </div>

          <div className="mt-2 space-y-1">
            {attachments.map((a, i) => (
              <div key={i} className="text-sm text-muted-foreground">
                {a}
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <Label>Tags</Label>

          <div className="flex gap-2 mt-2">
            <Input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Add a tag..."
            />
            <Button onClick={addTag}>Add</Button>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((t, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => removeTag(t)}
              >
                {t} ×
              </Badge>
            ))}
          </div>
        </div>

        {/* Submit */}
        <Button className="w-full mt-4">Publish Post</Button>
      </CardContent>
    </Card>
  );
};

export default PostCreate;