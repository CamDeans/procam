import { useGallery, useDeleteGalleryItem } from "@/hooks/use-gallery";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { Trash2, Download, Info, Eye, EyeOff, Maximize2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function GalleryPage() {
  const { data: items, isLoading } = useGallery();
  const deleteItem = useDeleteGalleryItem();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const handleDownload = (url: string, isOriginal: boolean) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `procam-${isOriginal ? "original" : "processed"}-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-pulse text-primary font-mono text-sm">LOADING GALLERY...</div>
      </div>
    );
  }

  const currentImageUrl = selectedItem 
    ? (showOriginal && selectedItem.originalUrl ? selectedItem.originalUrl : selectedItem.url)
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="p-4 sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-white/5 pwa-safe-top">
        <div className="flex items-center gap-3">
          <HamburgerMenu />
          <div>
            <h1 className="text-xl font-bold tracking-tight">Gallery</h1>
            <p className="text-xs text-zinc-500">
              {items?.length || 0} captures stored
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 grid grid-cols-3 gap-1">
        {items?.map((item) => (
          <motion.div
            layoutId={`image-${item.id}`}
            key={item.id}
            onClick={() => {
              setSelectedItem(item);
              setShowOriginal(false);
            }}
            className="aspect-square relative group cursor-pointer overflow-hidden bg-zinc-900"
            data-testid={`gallery-item-${item.id}`}
          >
            <img 
              src={item.thumbnailUrl || item.url} 
              alt="Capture" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-0 animate-in fade-in duration-500"
              onLoad={(e) => e.currentTarget.classList.remove('opacity-0')}
            />
          </motion.div>
        ))}
        {(!items || items.length === 0) && (
          <div className="col-span-3 py-20 text-center text-zinc-600 flex flex-col items-center gap-2">
            <Info size={40} className="opacity-20" />
            <p>No photos yet</p>
          </div>
        )}
      </div>

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="bg-black/95 border-zinc-800 text-white max-w-[95vw] sm:max-w-3xl p-0 overflow-y-auto max-h-[85vh]">
          <div className="relative w-full bg-black flex items-center justify-center min-h-[200px] max-h-[50vh]">
            {currentImageUrl && (
              <img 
                src={currentImageUrl} 
                alt={showOriginal ? "Original" : "Processed"} 
                className="max-w-full max-h-[50vh] object-contain"
              />
            )}
            
            <div className="absolute top-3 left-3">
              <Badge 
                variant="secondary" 
                className="bg-black/60 backdrop-blur-sm border border-white/10"
              >
                {selectedItem?.originalUrl 
                  ? (showOriginal ? "Original" : "Processed") 
                  : "Photo"
                }
              </Badge>
            </div>
          </div>
           
          <div className="p-4 space-y-4">
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {selectedItem?.metadata?.lens && (
                <Badge variant="outline" className="bg-zinc-900 border-zinc-700">
                  {selectedItem.metadata.lens}
                </Badge>
              )}
              {selectedItem?.metadata?.aperture && (
                <Badge variant="outline" className="bg-zinc-900 border-zinc-700">
                  {selectedItem.metadata.aperture}
                </Badge>
              )}
              {selectedItem?.metadata?.shutter && (
                <Badge variant="outline" className="bg-zinc-900 border-zinc-700">
                  {selectedItem.metadata.shutter}
                </Badge>
              )}
              {selectedItem?.metadata?.iso && (
                <Badge variant="outline" className="bg-zinc-900 border-zinc-700">
                  ISO {selectedItem.metadata.iso}
                </Badge>
              )}
              {selectedItem?.metadata?.whiteBalance && (
                <Badge variant="outline" className="bg-zinc-900 border-zinc-700">
                  {selectedItem.metadata.whiteBalance}K
                </Badge>
              )}
            </div>
            
            <div className="border-t border-zinc-800 pt-4">
              <p className="text-xs text-zinc-500 mb-3 font-medium uppercase tracking-wider">Actions</p>
              <div className="grid grid-cols-1 gap-2">
                {selectedItem?.originalUrl ? (
                  <Button 
                    variant="outline"
                    className="w-full bg-zinc-900 border-zinc-700 justify-start"
                    onClick={() => setShowOriginal(!showOriginal)}
                    data-testid="button-toggle-original"
                  >
                    {showOriginal ? <EyeOff size={18} className="mr-3" /> : <Eye size={18} className="mr-3" />}
                    {showOriginal ? "View Processed Image" : "View Original Image"}
                  </Button>
                ) : (
                  <div className="text-xs text-zinc-500 py-2">
                    Original image not saved for this photo
                  </div>
                )}
                
                <Button 
                  variant="outline"
                  className="w-full bg-zinc-900 border-zinc-700 justify-start"
                  onClick={() => currentImageUrl && handleDownload(currentImageUrl, showOriginal)}
                  data-testid="button-download"
                >
                  <Download size={18} className="mr-3" /> 
                  Download Photo
                </Button>
                
                <Button 
                  variant="outline"
                  className="w-full bg-zinc-900 border-zinc-700 justify-start"
                  onClick={() => {
                    if (currentImageUrl) {
                      setFullscreenImage(currentImageUrl);
                      setSelectedItem(null);
                    }
                  }}
                  data-testid="button-fullscreen"
                >
                  <Maximize2 size={18} className="mr-3" /> View Fullscreen
                </Button>
                
                <Button 
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={() => {
                    if (selectedItem) {
                      deleteItem.mutate(selectedItem.id);
                      setSelectedItem(null);
                    }
                  }}
                  data-testid="button-delete"
                >
                  <Trash2 size={18} className="mr-3" /> Delete Photo
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            onClick={() => setFullscreenImage(null)}
          >
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white z-10"
              data-testid="button-close-fullscreen"
            >
              <X size={24} />
            </button>
            <img
              src={fullscreenImage}
              alt="Fullscreen view"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
