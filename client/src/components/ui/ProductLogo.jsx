import { cn } from "../../lib/utils";

export function ProductLogo({ product, className }) {
  const getLogo = () => {
    switch (product) {
      case "Perkle":
        return (
          <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden">
            <img
              src="/assets/Perkle Logo.png"
              alt="Perkle"
              className="w-full h-full object-cover"
            />
          </div>
        );
      case "Blutic":
        return (
          <div className="w-full h-full rounded-xs flex items-center justify-center overflow-hidden">
            <img
              src="/assets/blutic-logo.png"
              alt="Blutic"
              className="w-full h-full object-cover"
            />
          </div>
        );
      case "Collectbot":
        return (
          <div className="w-full h-full rounded-xs flex items-center justify-center overflow-hidden">
            <img
              src="/assets/collectbot-logo.png"
              alt="Collectbot"
              className="w-full h-full object-cover"
            />
          </div>
        );
      case "ProfileX":
        return (
          <div className="w-full h-full rounded-xs flex items-center justify-center overflow-hidden">
            <img
              src="/assets/profilex-logo.png"
              alt="ProfileX"
              className="w-full h-full object-cover"
            />
          </div>
        );
      case "Svitch":
        return (
          <div className="w-full h-full rounded-xs flex items-center justify-center overflow-hidden">
            <img
              src="/assets/svitch-logo.png"
              alt="Svitch"
              className="w-full h-full object-cover"
            />
          </div>
        );
      case "Neokred":
        return (
          <div className="w-full h-full rounded-xs flex items-center justify-center overflow-hidden">
            <img
              src="/assets/Neokred-logo.png"
              alt="Neokred"
              className="w-full h-full object-cover"
            />
          </div>
        );
      default:
        return (
          <div className="w-full h-full bg-background-card-secondary rounded-xs flex items-center justify-center text-text-default-secondary text-xs font-bold">
            {product[0]}
          </div>
        );
    }
  };

  return <div className={cn("w-6 h-6 shrink-0", className)}>{getLogo()}</div>;
}
