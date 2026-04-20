import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Search,
  Eye,
  Ban,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import { api } from '@/lib/api';

const SubscriptionsTable = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch subscriptions from API
  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const response = await api.get("/creators/my-subscribers", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm || undefined,
          status: statusFilter === 'all' ? undefined : statusFilter
        }
      });
      
      // Handle response
      if (response.data.data && Array.isArray(response.data.data)) {
        setSubscriptions(response.data.data);
        setTotalItems(response.data.pagination?.totalItems || 0);
        setTotalPages(response.data.pagination?.totalPages || 0);
      } else if (Array.isArray(response.data)) {
        setSubscriptions(response.data);
        setTotalItems(response.data.length);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      } else {
        setSubscriptions([]);
        setTotalItems(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      setSubscriptions([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [currentPage, itemsPerPage, searchTerm, statusFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'paused':
        return <Badge variant="secondary">Paused</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0); // Scroll to top
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleViewDetails = (subscription) => {
    console.log('View details:', subscription);
  };

  const handleCancelSubscription = async (subscription) => {
    try {
      await api.put(`/subscriptions/${subscription._id}/cancel`);
      fetchSubscriptions();
    } catch (error) {
      console.error("Error cancelling subscription:", error);
    }
  };

  const handleResumeSubscription = async (subscription) => {
    try {
      await api.put(`/subscriptions/${subscription._id}/resume`);
      fetchSubscriptions();
    } catch (error) {
      console.error("Error resuming subscription:", error);
    }
  };

  const handleReactivateSubscription = async (subscription) => {
    try {
      await api.put(`/subscriptions/${subscription._id}/reactivate`);
      fetchSubscriptions();
    } catch (error) {
      console.error("Error reactivating subscription:", error);
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Filters</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or tier..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 h-9 text-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}>
            <SelectTrigger className="w-40 h-9 text-sm">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Subscriber</TableHead>
              <TableHead className="text-xs">Tier</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Start Date</TableHead>
              <TableHead className="text-xs">Next Billing</TableHead>
              <TableHead className="text-xs">Auto Renew</TableHead>
              <TableHead className="text-right text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm py-6">
                  Loading subscriptions...
                </TableCell>
              </TableRow>
            ) : subscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm py-6">
                  No subscriptions found
                </TableCell>
              </TableRow>
            ) : (
              subscriptions.map((subscription) => (
                <TableRow key={subscription._id}>
                  <TableCell className="py-3">
                    <div>
                      <div className="text-sm font-medium">
                        {subscription.subscriberId?.name || 'Unknown'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {subscription.subscriberId?.email || 'No email'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm py-3">
                    {subscription.tierType || 'Unknown'}
                  </TableCell>
                  <TableCell className="py-3">
                    {getStatusBadge(subscription.status)}
                  </TableCell>
                  <TableCell className="text-sm py-3">
                    {formatDate(subscription.startDate)}
                  </TableCell>
                  <TableCell className="text-sm py-3">
                    {formatDate(subscription.nextBillingDate)}
                  </TableCell>
                  <TableCell className="py-3">
                    {subscription.autoRenew ? (
                      <Badge variant="outline" className="text-xs">Yes</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">No</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleViewDetails(subscription)} 
                          className="text-xs"
                        >
                          <Eye className="mr-2 h-3.5 w-3.5" />
                          View Details
                        </DropdownMenuItem>
                        {subscription.status === 'active' && (
                          <DropdownMenuItem 
                            onClick={() => handleCancelSubscription(subscription)} 
                            className="text-xs"
                          >
                            <Ban className="mr-2 h-3.5 w-3.5" />
                            Cancel
                          </DropdownMenuItem>
                        )}
                        {subscription.status === 'paused' && (
                          <DropdownMenuItem 
                            onClick={() => handleResumeSubscription(subscription)} 
                            className="text-xs"
                          >
                            <RefreshCw className="mr-2 h-3.5 w-3.5" />
                            Resume
                          </DropdownMenuItem>
                        )}
                        {subscription.status === 'cancelled' && (
                          <DropdownMenuItem 
                            onClick={() => handleReactivateSubscription(subscription)} 
                            className="text-xs"
                          >
                            <CheckCircle className="mr-2 h-3.5 w-3.5" />
                            Reactivate
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!loading && totalItems > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Rows per page:</span>
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="w-16 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">
                {startIndex}-{endIndex} of {totalItems}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex gap-0.5">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="h-8 w-8"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsTable;