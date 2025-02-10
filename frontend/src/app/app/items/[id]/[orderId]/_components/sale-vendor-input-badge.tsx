import { Chip } from "@heroui/react";

export default function VendorInputBadge({
  getValue,
  existingNames,
}: {
  getValue: () => string;
  existingNames: string[];
}) {
  const inputValue = getValue().toLowerCase().trim();
  const lowercaseNames = existingNames.map((name) => name.toLowerCase());
  if (!inputValue) {
    return null;
  }
  if (lowercaseNames.includes(inputValue)) {
    return (
      <Chip color='success' variant='dot'>
        Existing Vendor
      </Chip>
    );
  }
  return (
    <Chip color='primary' variant='dot'>
      New Vendor
    </Chip>
  );
}
