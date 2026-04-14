import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import CollectionCard from '../collection/CollectionCard';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { RotateCw, Plus, FolderOpen, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

const Collections = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [collections, setCollections] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const isStandalonePage = location.pathname === '/creator/collections';

    useEffect(() => {
        if (window.location.search || window.location.hash) {
            navigate('/creator/collections', { replace: true });
        }
    }, []);

    const fetchCollections = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get("/collections/my");
            console.log("Collections response:", response);
            
            if (response.data.success) {
                setCollections(response.data.data.collections || []);
            } else {
                setError(response.data.error || "Failed to fetch collections");
            }
        } catch (err) {
            setError(err.message || "Failed to fetch collections");
            console.error("Error fetching collections:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCollections();
    }, []);

    const handleDeleteCollection = (deletedId) => {
        setCollections(collections.filter(c => c._id !== deletedId));
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-12">
                <RotateCw className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading collections...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 p-4 border border-red-300 rounded-md bg-red-50">
                Error: {error}
            </div>
        );
    }

    if (collections.length === 0) {
        return (
            <div className="text-center py-12">
                {isStandalonePage && (
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate('/creator')}
                        className="mb-6 gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Button>
                )}
                <div className="mb-4">
                    <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Collections Yet</h3>
                <p className="text-muted-foreground mb-6">
                    Create your first collection to organize your posts
                </p>
                <Link to="/creator/collections/create">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Collection
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full px-4 py-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    {isStandalonePage && (
                        <Button 
                            variant="ghost" 
                            onClick={() => navigate('/creator')}
                            className="gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Button>
                    )}
                    <h2 className="text-2xl font-bold">Collections</h2>
                </div>
                <div className="flex gap-2">
                    <Link to="/creator/collections/create">
                        <Button size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            New Collection
                        </Button>
                    </Link>
                    <Button 
                        onClick={fetchCollections} 
                        disabled={isLoading}
                        variant="outline"
                        size="sm"
                    >
                        <RotateCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-4 max-w-4xl mx-auto">
                {collections.map((collection) => (
                    <CollectionCard
                        key={collection._id}
                        id={collection._id}
                        title={collection.title}
                        description={collection.description}
                        posts={collection.posts || []}
                        postCount={collection.posts.length}
                        publishedPostCount={collection.publishedPostCount}
                        createdAt={collection.createdAt}
                        onDelete={handleDeleteCollection}
                    />
                ))}
            </div>
        </div>
    );
};

export default Collections;