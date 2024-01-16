import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function InputFileXlsXlsx({ onChange }: any) {
    return (
        <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="sheet">Planilha</Label>
            <Input accept=".xlsx, .xls" id="sheet" type="file" onChange={onChange} />
        </div>
    )
}
