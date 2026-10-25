import { Eye, EyeOff } from "lucide-react"
import { useState, type ComponentProps } from "react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

function PasswordInput({
  className,
  disabled,
  ...props
}: Omit<ComponentProps<typeof InputGroupInput>, "type">) {
  const [visible, setVisible] = useState(false)

  return (
    <InputGroup className={className}>
      <InputGroupInput
        {...props}
        disabled={disabled}
        type={visible ? "text" : "password"}
        spellCheck={false}
        className="h-full [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
          className="rounded-full"
          disabled={disabled}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

export { PasswordInput }
