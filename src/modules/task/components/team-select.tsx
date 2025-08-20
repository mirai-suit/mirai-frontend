import { Controller, Control, FieldPath, FieldValues } from "react-hook-form";
import { Select, SelectItem, Chip } from "@heroui/react";
import { Users, UsersThree } from "@phosphor-icons/react";

interface TeamSelectProps<T extends FieldValues> {
    control: Control<T>;
    teams: Array<{
        id: string;
        name: string;
        color: string;
        memberCount: number;
    }>;
    name?: FieldPath<T>;
    label?: string;
    placeholder?: string;
    isRequired?: boolean;
}

export const TeamSelect = <T extends FieldValues>({
    control,
    teams,
    name = "teamId" as FieldPath<T>,
    label = "Assign to Team",
    placeholder = "Select a team to assign this task",
    isRequired = true,
}: TeamSelectProps<T>) => {
    return (
        <Controller
            control={control}
            name={name}
            rules={{ required: isRequired ? "Please select a team" : false }}
            render={({ field, fieldState: { error } }) => {
                const selectedTeam = teams.find((team) => team.id === field.value);

                return (
                    <div className="space-y-3">
                        <Select
                            classNames={{
                                trigger: "min-h-12",
                                value: "text-foreground-600",
                            }}
                            errorMessage={error?.message}
                            isInvalid={!!error}
                            label={label}
                            placeholder={
                                selectedTeam
                                    ? `${selectedTeam.name} (${selectedTeam.memberCount} members)`
                                    : placeholder
                            }
                            selectedKeys={field.value ? [field.value] : []}
                            size="sm"
                            startContent={<UsersThree height={16} width={16} />}
                            variant="flat"
                            onSelectionChange={(keys) => {
                                const selectedKey = Array.from(keys)[0] as string;
                                field.onChange(selectedKey);
                            }}
                        >
                            {teams.map((team) => (
                                <SelectItem
                                    key={team.id}
                                    textValue={team.name}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-4 h-4 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: team.color }}
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-small font-medium">
                                                {team.name}
                                            </span>
                                            <span className="text-tiny text-default-400 flex items-center gap-1">
                                                <Users height={12} width={12} />
                                                {team.memberCount} member{team.memberCount !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                </SelectItem>
                            ))}
                        </Select>

                        {/* Selected Team Display */}
                        {selectedTeam && (
                            <div className="space-y-2">
                                <span className="text-sm font-medium text-default-600">
                                    Task will be assigned to:
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    <Chip
                                        avatar={
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: selectedTeam.color }}
                                            />
                                        }
                                        color="primary"
                                        variant="flat"
                                        startContent={<UsersThree height={14} width={14} />}
                                    >
                                        {selectedTeam.name} - All {selectedTeam.memberCount} members
                                    </Chip>
                                </div>
                            </div>
                        )}
                    </div>
                );
            }}
        />
    );
};
