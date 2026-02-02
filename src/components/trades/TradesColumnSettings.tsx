import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  ColumnConfig,
  ColumnGroup,
} from '@/hooks/useTradesColumnVisibility';

interface TradesColumnSettingsProps {
  columns: ColumnConfig[];
  columnGroups: ColumnGroup[];
  onToggleColumn: (columnId: string) => void;
}

export const TradesColumnSettings = ({
  columns,
  columnGroups,
  onToggleColumn,
}: TradesColumnSettingsProps) => {
  const getColumnsByGroup = (groupId: string) => {
    return columns.filter(col => col.group === groupId);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <Settings2 className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        align="end" 
        className="w-72 p-4 max-h-[400px] overflow-y-auto"
        sideOffset={8}
      >
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Visible Columns</h4>
          
          {columnGroups.map((group, groupIndex) => (
            <div key={group.id}>
              {groupIndex > 0 && <Separator className="my-3" />}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {group.label}
                </p>
                <div className="space-y-2">
                  {getColumnsByGroup(group.id).map(column => (
                    <div
                      key={column.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={column.id}
                        checked={column.visible}
                        onCheckedChange={() => onToggleColumn(column.id)}
                      />
                      <Label
                        htmlFor={column.id}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {column.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
