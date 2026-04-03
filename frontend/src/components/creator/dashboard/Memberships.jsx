import React, { useEffect, useState } from 'react';
import MembershipCard from '../membership/MembershipCard';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { RotateCw } from 'lucide-react';

const Memberships = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get("/creators/products/me");
            console.log("Response : ", response);
            setData(response.data.data);
        } catch (err) {
            setError(err.message || "Failed to fetch memberships");
            console.error("Error fetching data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRefresh = () => {
        fetchData();
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Memberships</h2>
                <Button 
                    onClick={handleRefresh} 
                    disabled={isLoading}
                    variant="outline"
                    size="sm"
                >
                    <RotateCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    {isLoading ? 'Refreshing...' : 'Refresh'}
                </Button>
            </div>

            {error && (
                <div className="text-red-500 p-4 border border-red-300 rounded-md bg-red-50">
                    Error: {error}
                </div>
            )}

            {data && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Map through your memberships data */}
                    {data.memberShips?.map((membership) => (
                        <MembershipCard
                            key={membership._id}
                            id={membership._id}
                            tierName={membership.tierName}
                            price={membership.price}
                            perks={membership.perks}
                            description={membership.description}
                            isActive={membership.isActive}
                        />
                    ))}
                </div>
            )}
            
            {data === null && !isLoading && !error && (
                <div>No Memberships Found</div>
            )}

            {isLoading && (
                <div className="flex justify-center items-center p-8">
                    <RotateCw className="h-6 w-6 animate-spin text-gray-500" />
                    <span className="ml-2">Loading memberships...</span>
                </div>
            )}
        </div>
    );
};

export default Memberships;