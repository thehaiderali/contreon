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

const SubscriptionsTable = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dummy Data
  const dummySubscriptions = [
    {
      _id: '1',
      subscriberId: { _id: 'u1', name: 'John Doe', email: 'john@example.com' },
      creatorId: { _id: 'c1', name: 'Creator One', email: 'creator1@example.com' },
      tierType: 'Premium',
      stripeSubscriptionId: 'sub_123456',
      stripePriceId: 'price_123',
      status: 'active',
      startDate: new Date('2024-01-15'),
      nextBillingDate: new Date('2024-02-15'),
      cancelDate: null,
      autoRenew: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      _id: '2',
      subscriberId: { _id: 'u2', name: 'Jane Smith', email: 'jane@example.com' },
      creatorId: { _id: 'c1', name: 'Creator One', email: 'creator1@example.com' },
      tierType: 'Basic',
      stripeSubscriptionId: 'sub_789012',
      stripePriceId: 'price_456',
      status: 'active',
      startDate: new Date('2024-01-10'),
      nextBillingDate: new Date('2024-02-10'),
      cancelDate: null,
      autoRenew: true,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
    },
    {
      _id: '3',
      subscriberId: { _id: 'u3', name: 'Mike Johnson', email: 'mike@example.com' },
      creatorId: { _id: 'c2', name: 'Creator Two', email: 'creator2@example.com' },
      tierType: 'Pro',
      stripeSubscriptionId: 'sub_345678',
      stripePriceId: 'price_789',
      status: 'paused',
      startDate: new Date('2023-12-20'),
      nextBillingDate: new Date('2024-01-20'),
      cancelDate: null,
      autoRenew: false,
      createdAt: new Date('2023-12-20'),
      updatedAt: new Date('2024-01-05'),
    },
    {
      _id: '4',
      subscriberId: { _id: 'u4', name: 'Sarah Wilson', email: 'sarah@example.com' },
      creatorId: { _id: 'c1', name: 'Creator One', email: 'creator1@example.com' },
      tierType: 'Premium',
      stripeSubscriptionId: 'sub_901234',
      stripePriceId: 'price_123',
      status: 'cancelled',
      startDate: new Date('2023-11-01'),
      nextBillingDate: new Date('2023-12-01'),
      cancelDate: new Date('2023-12-01'),
      autoRenew: false,
      createdAt: new Date('2023-11-01'),
      updatedAt: new Date('2023-12-01'),
    },
    {
      _id: '5',
      subscriberId: { _id: 'u5', name: 'Alex Chen', email: 'alex@example.com' },
      creatorId: { _id: 'c3', name: 'Creator Three', email: 'creator3@example.com' },
      tierType: 'Basic',
      stripeSubscriptionId: 'sub_567890',
      stripePriceId: 'price_456',
      status: 'active',
      startDate: new Date('2024-01-05'),
      nextBillingDate: new Date('2024-02-05'),
      cancelDate: null,
      autoRenew: true,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-05'),
    },
    {
      _id: '6',
      subscriberId: { _id: 'u6', name: 'Emily Brown', email: 'emily@example.com' },
      creatorId: { _id: 'c2', name: 'Creator Two', email: 'creator2@example.com' },
      tierType: 'Pro',
      stripeSubscriptionId: 'sub_654321',
      stripePriceId: 'price_789',
      status: 'active',
      startDate: new Date('2024-01-12'),
      nextBillingDate: new Date('2024-02-12'),
      cancelDate: null,
      autoRenew: true,
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-12'),
    },
    {
      _id: '7',
      subscriberId: { _id: 'u7', name: 'David Lee', email: 'david@example.com' },
      creatorId: { _id: 'c1', name: 'Creator One', email: 'creator1@example.com' },
      tierType: 'Premium',
      stripeSubscriptionId: 'sub_987654',
      stripePriceId: 'price_123',
      status: 'paused',
      startDate: new Date('2023-12-28'),
      nextBillingDate: new Date('2024-01-28'),
      cancelDate: null,
      autoRenew: true,
      createdAt: new Date('2023-12-28'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      _id: '8',
      subscriberId: { _id: 'u8', name: 'Lisa Anderson', email: 'lisa@example.com' },
      creatorId: { _id: 'c3', name: 'Creator Three', email: 'creator3@example.com' },
      tierType: 'Basic',
      stripeSubscriptionId: 'sub_246813',
      stripePriceId: 'price_456',
      status: 'active',
      startDate: new Date('2024-01-18'),
      nextBillingDate: new Date('2024-02-18'),
      cancelDate: null,
      autoRenew: true,
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-18'),
    },
    {
      _id: '9',
      subscriberId: { _id: 'u9', name: 'Tom Wilson', email: 'tom@example.com' },
      creatorId: { _id: 'c2', name: 'Creator Two', email: 'creator2@example.com' },
      tierType: 'Pro',
      stripeSubscriptionId: 'sub_135792',
      stripePriceId: 'price_789',
      status: 'cancelled',
      startDate: new Date('2023-10-15'),
      nextBillingDate: new Date('2023-11-15'),
      cancelDate: new Date('2023-11-15'),
      autoRenew: false,
      createdAt: new Date('2023-10-15'),
      updatedAt: new Date('2023-11-15'),
    },
    {
      _id: '10',
      subscriberId: { _id: 'u10', name: 'Maria Garcia', email: 'maria@example.com' },
      creatorId: { _id: 'c1', name: 'Creator One', email: 'creator1@example.com' },
      tierType: 'Premium',
      stripeSubscriptionId: 'sub_864209',
      stripePriceId: 'price_123',
      status: 'active',
      startDate: new Date('2024-01-08'),
      nextBillingDate: new Date('2024-02-08'),
      cancelDate: null,
      autoRenew: true,
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date('2024-01-08'),
    },
    {
      _id: '11',
      subscriberId: { _id: 'u11', name: 'James Taylor', email: 'james@example.com' },
      creatorId: { _id: 'c3', name: 'Creator Three', email: 'creator3@example.com' },
      tierType: 'Basic',
      stripeSubscriptionId: 'sub_975318',
      stripePriceId: 'price_456',
      status: 'active',
      startDate: new Date('2024-01-14'),
      nextBillingDate: new Date('2024-02-14'),
      cancelDate: null,
      autoRenew: true,
      createdAt: new Date('2024-01-14'),
      updatedAt: new Date('2024-01-14'),
    },
    {
      _id: '12',
      subscriberId: { _id: 'u12', name: 'Rachel Green', email: 'rachel@example.com' },
      creatorId: { _id: 'c2', name: 'Creator Two', email: 'creator2@example.com' },
      tierType: 'Premium',
      stripeSubscriptionId: 'sub_246802',
      stripePriceId: 'price_123',
      status: 'paused',
      startDate: new Date('2023-12-25'),
      nextBillingDate: new Date('2024-01-25'),
      cancelDate: null,
      autoRenew: false,
      createdAt: new Date('2023-12-25'),
      updatedAt: new Date('2024-01-10'),
    },
  ];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setSubscriptions(dummySubscriptions);
      setLoading(false);
    }, 500);
  }, []);

  // Get status badge - default shadcn colors
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

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch =
      searchTerm === '' ||
      sub.subscriberId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.subscriberId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.tierType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSubscriptions = filteredSubscriptions.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleViewDetails = (subscription) => {
    console.log('View details:', subscription);
    // Implement view details logic
  };

  const handleCancelSubscription = (subscription) => {
    console.log('Cancel subscription:', subscription);
    // Implement cancel logic
  };

  const handleResumeSubscription = (subscription) => {
    console.log('Resume subscription:', subscription);
    // Implement resume logic
  };

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
            ) : currentSubscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm py-6">
                  No subscriptions found
                </TableCell>
              </TableRow>
            ) : (
              currentSubscriptions.map((subscription) => (
                <TableRow key={subscription._id}>
                  <TableCell className="py-3">
                    <div>
                      <div className="text-sm font-medium">{subscription.subscriberId.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {subscription.subscriberId.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm py-3">{subscription.tierType}</TableCell>
                  <TableCell className="py-3">{getStatusBadge(subscription.status)}</TableCell>
                  <TableCell className="text-sm py-3">{formatDate(subscription.startDate)}</TableCell>
                  <TableCell className="text-sm py-3">
                    {subscription.nextBillingDate ? formatDate(subscription.nextBillingDate) : '-'}
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
                        <DropdownMenuItem onClick={() => handleViewDetails(subscription)} className="text-xs">
                          <Eye className="mr-2 h-3.5 w-3.5" />
                          View Details
                        </DropdownMenuItem>
                        {subscription.status === 'active' && (
                          <DropdownMenuItem onClick={() => handleCancelSubscription(subscription)} className="text-xs">
                            <Ban className="mr-2 h-3.5 w-3.5" />
                            Cancel
                          </DropdownMenuItem>
                        )}
                        {subscription.status === 'paused' && (
                          <DropdownMenuItem onClick={() => handleResumeSubscription(subscription)} className="text-xs">
                            <RefreshCw className="mr-2 h-3.5 w-3.5" />
                            Resume
                          </DropdownMenuItem>
                        )}
                        {subscription.status === 'cancelled' && (
                          <DropdownMenuItem className="text-xs">
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
      {!loading && filteredSubscriptions.length > 0 && (
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
                {startIndex + 1}-{Math.min(endIndex, filteredSubscriptions.length)} of {filteredSubscriptions.length}
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