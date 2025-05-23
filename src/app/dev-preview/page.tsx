'use client';

import { Select } from "@src/components/ui/Select";
export default function DevPreview() {
  return (
    <div className="p-4">
      <Select
  size="lg"
  variant="lavender"
  options={[
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" }
  ]}
/>
    </div>
  );
}