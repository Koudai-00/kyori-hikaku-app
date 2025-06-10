import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function AdModal({ isOpen, onClose, onComplete }: AdModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogTitle className="text-lg font-semibold text-text-primary text-center">
          月間利用制限に達しました
        </DialogTitle>
        <div className="text-center p-2">
          <p className="text-text-secondary text-sm mb-6">
            継続して利用するには、以下の広告を視聴してください。
          </p>
          
          {/* 利用制限適用時の広告表示エリア */}
          <div 
            className="bg-white border border-gray-200 rounded-lg p-4 mb-6 min-h-[250px] flex items-center justify-center"
            id="zucks-ad-container"
            dangerouslySetInnerHTML={{
              __html: '<script type="text/javascript" src="https://j.zucks.net.zimg.jp/j?f=693608"></script>'
            }}
          >
          </div>
          
          <Button
            onClick={onComplete}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            継続利用
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}