import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onAccept: () => void;
  onCancel: () => void;
  pincode?: string;
}

export default function IndiaPostNonReturnableModal({
  isOpen,
  onAccept,
  onCancel,
  pincode,
}: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent
        className="max-w-md rounded-2xl"
        data-ocid="india_post_nonreturnable.dialog"
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="text-lg font-bold text-gray-900 leading-snug">
              Non-Returnable Delivery Notice
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {pincode && (
            <p className="text-xs text-gray-400">
              Pincode:{" "}
              <span className="font-mono font-semibold text-gray-600">
                {pincode}
              </span>
            </p>
          )}

          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
            <p className="text-sm text-amber-900 leading-relaxed">
              Aapka area hamare private courier partners ki reach se bahar hai.
              Yeh order <strong className="text-gray-900">India Post</strong> se
              bheja jayega. India Post orders ke liye{" "}
              <strong className="text-red-700">
                Return Policy available nahi hai
              </strong>
              . Kya aap is Non-Returnable delivery ke liye taiyar hain?
            </p>
          </div>

          <p className="text-xs text-red-600 font-medium">
            ⚠️ Is order par koi return ya exchange nahi hoga.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            data-ocid="india_post_nonreturnable.cancel_button"
          >
            Cancel Order
          </Button>
          <Button
            onClick={onAccept}
            className="flex-1 text-white font-semibold"
            style={{ backgroundColor: "#DC2626" }}
            data-ocid="india_post_nonreturnable.confirm_button"
          >
            Yes, I Accept (No Return)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
