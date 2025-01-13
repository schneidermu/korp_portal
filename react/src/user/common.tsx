import { HTMLInputTypeAttribute, ReactNode } from "react";

import clsx from "clsx/lite";

export const EditableProperty = ({
  icon,
  name,
  wrap = false,
  children,
}: {
  icon: string;
  name: string;
  wrap?: boolean;
  children: ReactNode;
}) => {
  return (
    <div className={clsx("h-full", wrap ? "mt-[7.5px]" : "flex items-center")}>
      <img
        style={{ width: "30px", height: "30px" }}
        src={icon}
        alt=""
        className="inline-block mr-[20px]"
      />
      <span
        className={clsx("inline-block", "shrink-0 mr-[10px] text-dark-gray")}
      >
        {name}:
      </span>
      {children}
    </div>
  );
};

export const PropertyInput = ({
  type = "text",
  editing,
  pattern,
  value,
  text,
  theme,
  placeholder,
  required,
  handleChange,
}: {
  type?: HTMLInputTypeAttribute;
  editing: boolean;
  pattern?: string;
  value: string;
  text?: string;
  theme?: string;
  placeholder?: string;
  required?: boolean;
  handleChange: (value: string) => void;
}) => {
  return editing ? (
    <input
      type={type}
      pattern={pattern}
      placeholder={placeholder}
      required={required}
      className={clsx(
        "w-full",
        "border rounded border-black",
        "invalid:border-[#f00]",
        theme,
      )}
      value={value}
      onChange={(e) => handleChange(e.target.value)}
    />
  ) : (
    <span>{text || value}</span>
  );
};

export const PropertySelect = ({
  editing,
  value,
  options,
  handleSelect: handleChange,
}: {
  editing: boolean;
  value?: string;
  options?: [string, string][];
  handleSelect: (value: string, text: string) => void;
}) => {
  let text = undefined;
  for (const [v, t] of options || []) {
    if (v === value) text = t;
  }

  return editing ? (
    <select
      className={clsx(
        "w-full px-[10px] py-[6px]",
        "border rounded bg-white border-black",
      )}
      value={value}
      onChange={(e) => handleChange(e.target.value, e.target.textContent || "")}
    >
      {options &&
        options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
    </select>
  ) : (
    <span>{text}</span>
  );
};
