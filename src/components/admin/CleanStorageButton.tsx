
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const CleanStorageButton = () => {
    const [isCleaning, setIsCleaning] = useState(false);
    const [stats, setStats] = useState<{ scanned: number; deleted: number; spaceSaved: string } | null>(null);

    const handleCleanup = async () => {
        setIsCleaning(true);
        setStats(null);
        try {
            // 1. Fetch all shoes to get valid image URLs
            const { data: shoes, error: dbError } = await supabase
                .from('shoes')
                .select('image_url, additional_images');

            if (dbError) throw dbError;

            // 2. Extract all valid file paths
            const validPaths = new Set<string>();

            const getPathFromUrl = (url: string) => {
                try {
                    // URL format: .../storage/v1/object/public/shoe-images/shoes/file.webp
                    // We need 'shoes/file.webp' (or whatever structure is inside the bucket)
                    // Adjust this split based on actual URL structure if needed
                    const parts = url.split('/shoe-images/');
                    if (parts.length > 1) {
                        return decodeURIComponent(parts[1]);
                    }
                } catch (e) {
                    console.error("Error parsing URL:", url);
                }
                return null;
            };

            shoes?.forEach(shoe => {
                if (shoe.image_url) {
                    const path = getPathFromUrl(shoe.image_url);
                    if (path) validPaths.add(path);
                }
                if (shoe.additional_images && Array.isArray(shoe.additional_images)) {
                    shoe.additional_images.forEach((url: string) => {
                        const path = getPathFromUrl(url);
                        if (path) validPaths.add(path);
                    });
                }
            });

            // 3. List all files in storage bucket
            // Note: This matches the 'shoes' folder structure used in uploads
            const { data: files, error: listError } = await supabase.storage
                .from('shoe-images')
                .list('shoes', { limit: 1000, offset: 0 });

            if (listError) throw listError;

            // 4. Identify orphans
            const orphanedFiles: string[] = [];
            let orphanedSize = 0;

            files?.forEach(file => {
                // Construct the full path as stored in bucket
                const fullPath = `shoes/${file.name}`;

                // Check if this path exists in our valid paths set
                if (!validPaths.has(fullPath)) {
                    orphanedFiles.push(fullPath);
                    orphanedSize += file.metadata?.size || 0;
                }
            });

            // 5. Delete orphaned files
            if (orphanedFiles.length > 0) {
                // Delete in batches of 100
                const batchSize = 100;
                for (let i = 0; i < orphanedFiles.length; i += batchSize) {
                    const batch = orphanedFiles.slice(i, i + batchSize);
                    const { error: deleteError } = await supabase.storage
                        .from('shoe-images')
                        .remove(batch);

                    if (deleteError) {
                        console.error("Partial delete error:", deleteError);
                        throw deleteError;
                    }
                }
            }

            setStats({
                scanned: files?.length || 0,
                deleted: orphanedFiles.length,
                spaceSaved: (orphanedSize / 1024 / 1024).toFixed(2) + ' MB'
            });

            if (orphanedFiles.length > 0) {
                toast.success(`Cleanup complete: Removed ${orphanedFiles.length} files.`);
            } else {
                toast.info("No orphaned files found.");
            }

        } catch (error: any) {
            console.error("Cleanup failed:", error);
            toast.error("Cleanup failed: " + error.message);
        } finally {
            setIsCleaning(false);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="outline"
                    className="gap-2 text-black border-black border font-bold h-10 px-4 transition-all hover:bg-black hover:text-white"
                >
                    <Trash2 className="h-4 w-4" />
                    Clean Storage
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Clean Orphaned Images?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will scan your storage for images that are not linked to any product in the database and permanently delete them.<br /><br />
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {stats && (
                    <div className="bg-muted p-3 dashed rounded-md mb-4 text-sm">
                        <p>Scanned: {stats.scanned} files</p>
                        <p className="font-bold text-green-600">Deleted: {stats.deleted} files</p>
                        <p>Space Saved: {stats.spaceSaved}</p>
                    </div>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setStats(null)}>Close</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => { e.preventDefault(); handleCleanup(); }}
                        disabled={isCleaning}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isCleaning ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Cleaning...
                            </>
                        ) : (
                            'Run Cleanup'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default CleanStorageButton;
