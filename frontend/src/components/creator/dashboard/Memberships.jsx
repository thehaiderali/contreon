import React, { useEffect, useState } from 'react';
import MembershipCard from '../membership/MembershipCard';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { RotateCw } from 'lucide-react';
import NoMemberships from '@/src/pages/private/creator/dashboard/NoMemberships';
import { Link } from 'react-router';

const Memberships = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get("/creators/memberships/me");
            console.log("Response : ", response);
            setData(response.data.data.memberShips);
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

    // Check if data is an empty array
    const isEmptyMemberships = Array.isArray(data) && data.length === 0;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Memberships</h2>
                <div className="flex gap-2">
                    <Link to="/creator/memberships/create">
                        <Button variant="default" size="sm">
                            Create Membership
                        </Button>
                    </Link>
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
            </div>

            {error && (
                <div className="text-red-500 p-4 border border-red-300 rounded-md bg-red-50">
                    Error: {error}
                </div>
            )}

            {!isLoading && !error && data && !isEmptyMemberships && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.map((membership) => (
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
            
            {/* Show NoMemberships component when memberships array is empty */}
            {!isLoading && !error && data && isEmptyMemberships && (
                <NoMemberships />
            )}

            {/* Show loading state */}
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