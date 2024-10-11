import * as React from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function TimezoneSelect() {
  return (
    <Select defaultValue={"America/Los_Angeles"}>
      <SelectTrigger className="w-[14rem]">
        <SelectValue placeholder="PT - America/Los Angeles" defaultValue={"America/Los_Angeles"} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Timezones</SelectLabel>
          <SelectItem value="America/New_York">ET - America/New York</SelectItem>
          <SelectItem value="America/Chicago">CT - America/Chicago</SelectItem>
          <SelectItem value="America/Denver">MT - America/Denver</SelectItem>
          <SelectItem value="America/Los_Angeles">PT - America/Los Angeles</SelectItem>
          <SelectItem value="America/Anchorage">AKT - America/Anchorage</SelectItem>
          <SelectItem value="Pacific/Honolulu">HAT - Pacific/Honolulu</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
