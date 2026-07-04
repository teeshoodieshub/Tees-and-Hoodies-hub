import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronLeft, Loader2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import {
  createOrder,
  getDcmPaymentOutcome,
  initiateDcmPayment,
  updateOrderPaymentState,
} from "@/lib/supabaseApi";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PaymentSubmissionScreen,
  type PaymentSubmissionPreview,
} from "@/components/PaymentScreens";
import {
  formatOrderCode,
  persistSubmittedPayment,
  readSubmittedPayment,
  type SubmittedPayment,
} from "@/lib/paymentSession";
import type { CartItem } from "@/context/CartContext";

const NETWORKS = [
  { id: "mtn", name: "MTN", value: "MTN" },
  { id: "airteltigo", name: "AirtelTigo Money", value: "AirtelTigo" },
  { id: "telecel", name: "Telecel Cash", value: "Telecel" },
];

type CheckoutErrorContextBody = {
  error?: string;
  message?: string;
};

type CheckoutError = Error & {
  context?: {
    json?: (() => Promise<CheckoutErrorContextBody>) | CheckoutErrorContextBody;
  };
};

type CheckoutPaymentMode = "mobile_money" | "pay_on_delivery";

const CUSTOM_PRINT_DEPOSIT_RATIO = 0.5;

function requiresCustomization(item: CartItem) {
  const category = item.product.category.toLowerCase();
  const id = item.product.id.toLowerCase();
  const name = item.product.name.toLowerCase();

  return [category, id, name].some((value) => value.includes("custom"));
}

function normalizePhoneNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("0")) {
    return `233${digits.substring(1)}`;
  }

  if (digits.length >= 9 && !digits.startsWith("233")) {
    return `233${digits}`;
  }

  return digits;
}

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submissionPreview, setSubmissionPreview] = useState<PaymentSubmissionPreview | null>(null);
  const [deliveryOrderCode, setDeliveryOrderCode] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customer_name: "",
    email: "",
    phone_number: "",
    shipping_address: "",
    shipping_city: "Accra",
    payment_network: NETWORKS[0].value,
  });

  const hasCustomPrintItems = items.some(requiresCustomization);
  const amountDueNow = hasCustomPrintItems
    ? Number((totalPrice * CUSTOM_PRINT_DEPOSIT_RATIO).toFixed(2))
    : totalPrice;
  const remainingBalance = Math.max(0, totalPrice - amountDueNow);

  if (!submissionPreview && readSubmittedPayment()) {
    return <Navigate to="/payment-status" replace />;
  }

  if (submissionPreview) {
    return <PaymentSubmissionScreen payment={submissionPreview} />;
  }

  if (deliveryOrderCode) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-16 pt-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-border bg-secondary/20 px-6 py-12 text-center md:px-12"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700">
            <CheckCircle2 className="h-8 w-8" strokeWidth={1.8} />
          </div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Pay On Delivery
          </p>
          <h1 className="mt-3 text-3xl font-semibold uppercase tracking-[0.14em]">
            Order placed
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-muted-foreground">
            Order {deliveryOrderCode} has been received. We will contact you to confirm delivery,
            and payment will be collected when the order arrives.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={() => navigate("/shop")} className="rounded-none uppercase tracking-[0.18em]">
              Continue Shopping
            </Button>
            <Button
              onClick={() => setDeliveryOrderCode(null)}
              variant="outline"
              className="rounded-none uppercase tracking-[0.18em]"
            >
              View Checkout
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <ShoppingBag className="w-12 h-12 mb-4 text-muted-foreground" strokeWidth={1} />
        <h2 className="text-xl font-medium uppercase tracking-widest mb-4">Your cart is empty</h2>
        <Button onClick={() => navigate("/shop")} variant="outline">
          Return to Shop
        </Button>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleNetworkChange = (value: string) => {
    setFormData({ ...formData, payment_network: value });
  };

  const validateCheckoutDetails = (paymentMode: CheckoutPaymentMode) => {
    const requiredFields = [
      formData.customer_name,
      formData.email,
      formData.phone_number,
      formData.shipping_address,
      formData.shipping_city,
    ];

    if (requiredFields.some((value) => !value.trim())) {
      toast({
        title: "Missing Order Details",
        description: "Please complete your contact and delivery details.",
        variant: "destructive",
      });
      return null;
    }

    const normalizedPhone = normalizePhoneNumber(formData.phone_number);

    if (normalizedPhone.length < 12) {
      toast({
        title: "Invalid Phone Number",
        description:
          paymentMode === "pay_on_delivery"
            ? "Please enter a valid delivery phone number."
            : "Please enter a valid mobile money number.",
        variant: "destructive",
      });
      return null;
    }

    return normalizedPhone;
  };

  const submitCheckout = async (paymentMode: CheckoutPaymentMode) => {
    if (paymentMode === "pay_on_delivery" && hasCustomPrintItems) {
      toast({
        title: "Deposit Required",
        description: "Custom printing orders require a 50% mobile money deposit before work begins.",
        variant: "destructive",
      });
      return;
    }

    const normalizedPhone = validateCheckoutDetails(paymentMode);
    if (!normalizedPhone) return;

    setLoading(true);
    if (paymentMode === "mobile_money") {
      setSubmissionPreview({
        amount: amountDueNow,
        network: formData.payment_network,
        phoneNumber: normalizedPhone,
      });
    }

    let orderId: string | null = null;

    try {
      orderId = await createOrder(
        localStorage.getItem("tees_cart_id"),
        items,
        totalPrice,
        {
          ...formData,
          phone_number: normalizedPhone,
          payment_method:
            paymentMode === "pay_on_delivery"
              ? "Pay On Delivery"
              : hasCustomPrintItems
                ? "50% Mobile Money Deposit"
                : "Mobile Money",
          payment_network: paymentMode === "mobile_money" ? formData.payment_network : undefined,
          payment_status: paymentMode === "pay_on_delivery" ? "pay_on_delivery" : "pending",
        }
      );

      if (!orderId) {
        throw new Error("Failed to create order");
      }

      if (paymentMode === "pay_on_delivery") {
        clearCart();
        setDeliveryOrderCode(formatOrderCode(orderId));
        toast({
          title: "Order Placed",
          description: "Your order has been placed. Payment will be collected on delivery.",
        });
        return;
      }

      const paymentResult = await initiateDcmPayment(
        normalizedPhone,
        amountDueNow,
        formData.payment_network,
        orderId,
        hasCustomPrintItems
          ? `50% deposit for order ${orderId.slice(0, 8).toUpperCase()}`
          : undefined
      );

      const paymentOutcome = getDcmPaymentOutcome(paymentResult);
      await updateOrderPaymentState(orderId, paymentResult);

      const nextPayment: SubmittedPayment = {
        amount: amountDueNow,
        network: formData.payment_network,
        orderId,
        paymentStatus: paymentOutcome.status,
        phoneNumber: normalizedPhone,
        phase: paymentOutcome.phase,
        providerMessage: paymentOutcome.providerMessage,
        reference: paymentOutcome.reference,
        startedAt: Date.now(),
      };

      persistSubmittedPayment(nextPayment);

      if (paymentOutcome.accepted) {
        clearCart();
      }

      navigate("/payment-status", { replace: true });
    } catch (error: unknown) {
      console.error("Checkout Error details:", error);
      const checkoutError = error as CheckoutError;
      let errorMessage = checkoutError.message || "Something went wrong. Please try again.";

      if (checkoutError.context && typeof checkoutError.context.json === "function") {
        try {
          const body = await checkoutError.context.json();
          errorMessage = body.message || body.error || errorMessage;
        } catch {
          // Keep the fallback message when response parsing fails.
        }
      } else if (checkoutError.context?.json) {
        const body = checkoutError.context.json;
        errorMessage = body.message || body.error || errorMessage;
      }

      if (orderId) {
        const failedPayment: SubmittedPayment = {
          amount: totalPrice,
          network: formData.payment_network,
          orderId,
          paymentStatus: "failed",
          phoneNumber: normalizedPhone,
          phase: "failed",
          providerMessage: errorMessage,
          reference: "",
          startedAt: Date.now(),
        };

        persistSubmittedPayment(failedPayment);
        navigate("/payment-status", { replace: true });
      } else {
        toast({
          title: "Checkout Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      setSubmissionPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitCheckout("mobile_money");
  };

  const handlePayOnDelivery = async () => {
    await submitCheckout("pay_on_delivery");
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12 pt-24">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to shopping
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-2xl font-semibold uppercase tracking-wider mb-2">Checkout</h1>
            <p className="text-sm text-muted-foreground font-light">
              Complete your order details below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground pb-2 border-b">
                Shipping Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_name">Full Name</Label>
                  <Input
                    id="customer_name"
                    placeholder="John Doe"
                    required
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    className="rounded-none focus-visible:ring-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="rounded-none focus-visible:ring-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shipping_address">Delivery Address</Label>
                <Input
                  id="shipping_address"
                  placeholder="Street address, Apartment, etc."
                  required
                  value={formData.shipping_address}
                  onChange={handleInputChange}
                  className="rounded-none focus-visible:ring-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shipping_city">City</Label>
                <Input
                  id="shipping_city"
                  placeholder="Accra"
                  required
                  value={formData.shipping_city}
                  onChange={handleInputChange}
                  className="rounded-none focus-visible:ring-foreground"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h2 className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground pb-2 border-b">
                {hasCustomPrintItems ? "Deposit Payment (Mobile Money)" : "Payment Details"}
              </h2>
              <div className="border border-border bg-secondary/30 p-4 text-sm leading-6 text-muted-foreground">
                {hasCustomPrintItems ? (
                  <>
                    Custom printing orders require a 50% deposit before work begins. Pay{" "}
                    <span className="font-semibold text-foreground">
                      GHC {amountDueNow.toFixed(2)}
                    </span>{" "}
                    now, then settle the remaining{" "}
                    <span className="font-semibold text-foreground">
                      GHC {remainingBalance.toFixed(2)}
                    </span>{" "}
                    after confirmation.
                  </>
                ) : (
                  "Pay now with mobile money, or choose pay on delivery and settle the order when it arrives."
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_network">Network</Label>
                  <Select
                    onValueChange={handleNetworkChange}
                    defaultValue={formData.payment_network}
                  >
                    <SelectTrigger className="rounded-none focus:ring-foreground">
                      <SelectValue placeholder="Select network" />
                    </SelectTrigger>
                    <SelectContent>
                      {NETWORKS.map((network) => (
                        <SelectItem key={network.id} value={network.value}>
                          {network.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone_number">
                    {hasCustomPrintItems ? "Deposit Account Number (Momo)" : "Phone Number"}
                  </Label>
                  <Input
                    id="phone_number"
                    placeholder="233XXXXXXXXX"
                    required
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className="rounded-none focus-visible:ring-foreground"
                  />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                * For mobile money payments, use the number registered for your wallet. Approval
                prompts can take up to 60 seconds.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-foreground text-primary-foreground text-sm uppercase tracking-[0.2em] font-medium transition-opacity hover:opacity-90 rounded-none shadow-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : hasCustomPrintItems ? (
                  `Pay 50% Deposit - GHC ${amountDueNow.toFixed(2)}`
                ) : (
                  `Pay Now - GHC ${amountDueNow.toFixed(2)}`
                )}
              </Button>

              {!hasCustomPrintItems && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={handlePayOnDelivery}
                  className="w-full h-14 rounded-none text-sm font-medium uppercase tracking-[0.2em]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Pay On Delivery"
                  )}
                </Button>
              )}
            </div>
          </form>
        </motion.div>

        <div className="bg-secondary/30 p-8 space-y-8 h-fit lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold uppercase tracking-wider">Order Summary</h2>
          <div className="space-y-6">
            {items.map((item) => (
              <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-4">
                <div className="w-20 h-20 bg-secondary shrink-0 overflow-hidden">
                  <img
                    src={item.product.images?.[0] || ""}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">{item.product.name}</p>
                    <p className="text-sm font-semibold">
                      GHC {(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.size} /{" "}
                    {item.product.useDesignSelection
                      ? `Design: ${item.color}`
                      : `Color: ${item.color}`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">GHC {totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span className="font-medium text-emerald-600">Free</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-border pt-4">
              <span>Total</span>
              <span>GHC {totalPrice.toFixed(2)}</span>
            </div>
            {hasCustomPrintItems && (
              <div className="space-y-3 border-t border-border pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deposit due now</span>
                  <span className="font-semibold">GHC {amountDueNow.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remaining balance</span>
                  <span className="font-medium">GHC {remainingBalance.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
