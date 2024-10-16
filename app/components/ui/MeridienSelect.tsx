import * as React from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"

export function MeridienSelect() {
  return (
    <Select defaultValue={"AM"} >
      <SelectTrigger className="w-[4rem]">
        <SelectValue defaultValue={"AM"} placeholder={"AM"}/>
      </SelectTrigger>
      <SelectContent >
        <SelectGroup>
          <SelectLabel>Hours</SelectLabel>
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
