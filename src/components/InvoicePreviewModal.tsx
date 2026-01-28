import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Download } from "lucide-react";

interface InvoicePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    blobUrl: string | null;
    onDownload: () => void;
    orderCode: string;
}

const InvoicePreviewModal = ({
    isOpen,
    onClose,
    blobUrl,
    onDownload,
    orderCode,
}: InvoicePreviewModalProps) => {
    const handleDownload = () => {
        onDownload();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 overflow-hidden">
                <DialogHeader className="flex flex-row items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
                    <DialogTitle className="text-lg font-bold">
                        Invoice #{orderCode}
                    </DialogTitle>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleDownload}
                            className="text-sm font-medium underline underline-offset-4 hover:text-accent transition-colors flex items-center gap-1"
                        >
                            <Download className="w-4 h-4" />
                            Download Invoice
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-secondary rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </DialogHeader>
                <div className="flex-1 h-full overflow-hidden bg-secondary/30">
                    {blobUrl ? (
                        <iframe
                            src={blobUrl}
                            className="w-full h-[calc(90vh-60px)]"
                            title={`Invoice ${orderCode}`}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default InvoicePreviewModal;
