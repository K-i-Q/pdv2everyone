import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"; // Shadcn UI import
  import { Input } from "@/components/ui/input"; // Shandcn UI Input
  import { useReducer } from "react";
  import { UseFormReturn } from "react-hook-form";
  
  type LicensePlateInputProps = {
    form: UseFormReturn<any>;
    name: string;
    label: string;
    placeholder: string;
    autoComplete: string;
    disabled?: boolean;
  };
  
  export default function LicensePlateInput(props: LicensePlateInputProps) {
    const plateFormatter = (value: string) => {
      const upperValue = value.replace(/[^a-zA-Z0-9]/gi, '').toUpperCase();
      const includesHyphen = upperValue.length > 4 && '0123456789'.includes(upperValue.charAt(4));
      
      if (includesHyphen) {
        return upperValue.slice(0, 3) + '-' + upperValue.slice(3, 7);
      } else {
        return upperValue.slice(0, 7);
      }
    };
  
    const initialValue = props.form.getValues()[props.name]
      ? plateFormatter(props.form.getValues()[props.name])
      : "";
  
    const [value, setValue] = useReducer((_: any, next: string) => {
      return plateFormatter(next);
    }, initialValue);
  
    function handleChange(realChangeFn: Function, formattedValue: string) {
      const cleanedValue = formattedValue.replace(/\-/g, "");
      realChangeFn(cleanedValue);
    }
  
    return (
      <FormField
        control={props.form.control}
        name={props.name}
        render={({ field }) => {
          field.value = value;
          const _change = field.onChange;
  
          return (
            <FormItem>
              <FormLabel>{props.label}</FormLabel>
              <FormControl>
                <Input
                  placeholder={props.placeholder}
                  autoComplete={props.autoComplete}
                  disabled={props.disabled}
                  type="text"
                  {...field}
                  onChange={(ev) => {
                    setValue(ev.target.value);
                    handleChange(_change, ev.target.value);
                  }}
                  value={value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    );
  }