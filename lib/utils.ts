// Format price to AUD
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// Get price based on vehicle type
export function getPriceForVehicle(
  service: { priceHatchSedan: number; priceSuv: number; price4x4: number },
  vehicleType: string
): number {
  switch (vehicleType) {
    case "suv":
      return service.priceSuv;
    case "4x4":
      return service.price4x4;
    default:
      return service.priceHatchSedan;
  }
}

// Format vehicle type for display
export function formatVehicleType(type: string): string {
  switch (type) {
    case "hatch_sedan":
      return "Hatch/Sedan";
    case "suv":
      return "SUV";
    case "4x4":
      return "4x4";
    default:
      return type;
  }
}

// Format date
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Format status with proper casing
export function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Status colors for badges
export function getStatusColor(status: string): string {
  switch (status) {
    case "booked":
      return "bg-blue-100 text-blue-800";
    case "in_progress":
      return "bg-amber-100 text-amber-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

// Generate initials from name
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
