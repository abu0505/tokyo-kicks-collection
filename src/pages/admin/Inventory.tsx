import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, MoreVertical, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import AdminLayout from '@/components/admin/AdminLayout';
// AddShoeModal removed
import TextLoader from '@/components/TextLoader';
import CleanStorageButton from '@/components/admin/CleanStorageButton';
import { supabase } from '@/integrations/supabase/client';
import { DbShoe } from '@/types/database';
import { formatPrice } from '@/lib/format';
import { toast } from 'sonner';
import { useAdminInventory, ShoeWithSizes } from '@/hooks/useAdminInventory';
import { useIsMobile } from '@/hooks/use-mobile';



const Inventory = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // isAddModalOpen and editingShoe state removed
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const isMobile = useIsMobile();
  const pageSize = isMobile ? 10 : 12;

  // Fetch shoes with pagination
  const { data: inventoryData, isLoading, isFetching } = useAdminInventory({
    page,
    pageSize,
  });

  const shoes = inventoryData?.shoes || [];
  const totalCount = inventoryData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'in_stock' | 'sold_out' }) => {
      const { error } = await supabase
        .from('shoes')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shoes'] });
      toast.success('Status updated');
    },
    onError: (error) => {
      toast.error('Failed to update status: ' + error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // 1. Get the shoe data to find images
      const { data: shoe, error: fetchError } = await supabase
        .from('shoes')
        .select('image_url, additional_images')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error("Error fetching shoe for deletion cleanup:", fetchError);
        // We still proceed to delete the record if we can't fetch it? 
        // No, if we can't fetch it, maybe it doesn't exist or error. 
        // Let's just try to delete the record if fetch fails, as a fallback.
      } else if (shoe) {
        // 2. Collect all image paths
        const pathsToRemove: string[] = [];

        // Helper to extract path from URL
        const getPathFromUrl = (url: string) => {
          try {
            // URL format: .../storage/v1/object/public/shoe-images/folder/file.webp
            // We need 'folder/file.webp'
            // Split by bucket name 'shoe-images/'
            const parts = url.split('/shoe-images/');
            if (parts.length > 1) {
              return decodeURIComponent(parts[1]);
            }
          } catch (e) {
            console.error("Error parsing URL:", url, e);
          }
          return null;
        };

        if (shoe.image_url) {
          const path = getPathFromUrl(shoe.image_url);
          if (path) pathsToRemove.push(path);
        }

        if (shoe.additional_images && Array.isArray(shoe.additional_images)) {
          shoe.additional_images.forEach((url: string) => {
            const path = getPathFromUrl(url);
            if (path) pathsToRemove.push(path);
          });
        }

        // 3. Delete from storage
        if (pathsToRemove.length > 0) {
          const { error: storageError } = await supabase.storage
            .from('shoe-images')
            .remove(pathsToRemove);

          if (storageError) {
            console.error("Failed to remove images from storage:", storageError);
            toast.error("Failed to cleanup images from storage");
            // Continue to delete record anyway? Yes.
          } else {
            console.log("Successfully removed images:", pathsToRemove);
          }
        }
      }

      // 4. Delete the record
      const { error } = await supabase
        .from('shoes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shoes'] });
      toast.success('Shoe and associated images deleted');
      setDeleteConfirmId(null);
    },
    onError: (error) => {
      toast.error('Failed to delete: ' + error.message);
    },
  });

  const handleToggleStatus = (shoe: ShoeWithSizes) => {
    const newStatus = shoe.status === 'in_stock' ? 'sold_out' : 'in_stock';
    updateStatusMutation.mutate({ id: shoe.id, status: newStatus });
  };

  return (
    <AdminLayout
      header={
        <header className="h-auto md:h-20 shrink-0 bg-white border-b border-border px-4 py-4 md:py-0 md:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
          <div className="flex flex-col">
            <h2 className="text-xl md:text-2xl font-bold text-black tracking-tight actions uppercase">Inventory Management</h2>
            <p className="text-xs md:text-sm text-muted-foreground">View and manage your shoe inventory</p>
          </div>
          <div className="grid grid-cols-2 md:flex items-center gap-3 w-full md:w-auto">
            <CleanStorageButton className="w-full md:w-auto" />
            <button
              onClick={() => navigate('/admin/inventory/add')}
              className="h-10 w-full md:w-auto px-4 flex items-center justify-center gap-2 rounded-lg bg-accent hover:bg-accent/90 text-white text-sm font-bold transition-all shadow-md shadow-accent/30"
            >
              <Plus className="h-5 w-5" />
              Add Shoe
            </button>
          </div>
        </header>
      }
    >
      <div className="space-y-6">

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden"
        >
          <Table wrapperClassName="scrollbar-hide">
            <TableHeader>
              <TableRow className="border-b border-border bg-neutral-50/50 hover:bg-neutral-50/50">
                <TableHead className="font-bold min-w-[180px] md:min-w-0">Name</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold">Price</TableHead>
                <TableHead className="font-bold">Sizes</TableHead>
                <TableHead className="font-bold w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <TextLoader />
                  </TableCell>
                </TableRow>
              ) : shoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No shoes in inventory. Add your first shoe!
                  </TableCell>
                </TableRow>
              ) : (
                shoes.map((shoe, index) => (
                  <motion.tr
                    key={shoe.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.1 + index * 0.05 }}
                    className="border-b border-border hover:bg-neutral-50/50 transition-colors"
                    style={{ display: 'table-row' }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {shoe.image_url ? (
                          <img
                            src={shoe.image_url}
                            alt={shoe.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                            📦
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70 mb-0.5">{shoe.brand}</p>
                          <p className="font-bold text-sm leading-tight" title={shoe.name}>
                            {(() => {
                              const words = shoe.name.split(' ');
                              if (words.length <= 4) return shoe.name;
                              return (
                                <>
                                  {words.slice(0, 4).join(' ')}
                                  <br />
                                  {words.slice(4).join(' ')}
                                </>
                              );
                            })()}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={shoe.status === 'in_stock' ? 'default' : 'secondary'}
                        className={
                          shoe.status === 'in_stock'
                            ? 'bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/10 whitespace-nowrap'
                            : 'bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/10 whitespace-nowrap'
                        }
                      >
                        {shoe.status === 'in_stock' ? 'In Stock' : 'Sold Out'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold">
                      {formatPrice(shoe.price)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" className="h-auto p-0 hover:bg-transparent hover:text-foreground justify-start font-normal text-foreground">
                              <span className="text-sm">
                                Total Stock: <span className="font-bold">
                                  {shoe.shoe_sizes?.reduce((acc, curr) => acc + (curr.quantity || 0), 0) || 0}
                                </span>
                              </span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-56 p-3">
                            <div className="space-y-2">
                              <h4 className="font-bold text-sm border-b pb-1 mb-2">Stock Breakdown</h4>
                              {shoe.shoe_sizes && shoe.shoe_sizes.length > 0 ? (
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  {shoe.shoe_sizes
                                    .sort((a, b) => a.size - b.size)
                                    .map((sizeObj) => (
                                      <div key={sizeObj.id} className="flex items-center">
                                        <span className="text-muted-foreground">Size {sizeObj.size}:</span>
                                        <span className={sizeObj.quantity === 0 ? "text-red-500 font-bold" : "font-bold pl-2"}>
                                          {sizeObj.quantity} left
                                        </span>
                                      </div>
                                    ))}
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground">No stock data available.</p>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault();
                              handleToggleStatus(shoe);
                            }}
                            className="flex items-center gap-2 cursor-pointer group focus:bg-transparent focus:text-foreground"
                          >
                            <div className="pointer-events-none">
                              <Switch
                                checked={shoe.status === 'in_stock'}
                                className="data-[state=checked]:bg-red-400"
                              />
                            </div>
                            <span>
                              {shoe.status === 'in_stock' ? 'Mark as Sold Out' : 'Mark as In Stock'}
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/admin/inventory/edit/${shoe.id}`)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Shoe
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-accent-foreground"
                            onClick={() => setDeleteConfirmId(shoe.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {!isLoading && totalCount > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-secondary/50">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-bold text-foreground">{startItem}-{endItem}</span> of{' '}
                <span className="font-bold text-foreground">{totalCount}</span> items
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isFetching}
                  className="border-foreground/20"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || isFetching}
                  className="border-foreground/20"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>


      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent className="border border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black">Delete Shoe?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the shoe from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold"
              onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default Inventory;
