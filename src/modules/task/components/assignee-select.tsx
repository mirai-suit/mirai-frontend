import { Controller, Control, FieldPath, FieldValues } from "react-hook-form";
import { Select, SelectItem, Avatar, Chip } from "@heroui/react";
import { Users } from "@phosphor-icons/react";

interface AssigneeSelectProps<T extends FieldValues> {
  control: Control<T>;
  organizationMembers: Array<{
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      avatar?: string;
    };
  }>;
  name?: FieldPath<T>;
}

export const AssigneeSelect = <T extends FieldValues>({
  control,
  organizationMembers,
  name = "assigneeIds" as FieldPath<T>,
}: AssigneeSelectProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => {
        const selectedMembers = organizationMembers.filter((member) =>
          (field.value as string[])?.includes(member.user.id)
        );

        return (
          <div className="space-y-3">
            <Select
              classNames={{
                trigger: "min-h-12",
                value: "text-foreground-600",
              }}
              errorMessage={error?.message}
              isInvalid={!!error}
              label="Assign to Members"
              placeholder={
                selectedMembers.length > 0
                  ? `${selectedMembers.length} members selected`
                  : "Select members to assign this task"
              }
              selectedKeys={new Set(field.value || [])}
              selectionMode="multiple"
              size="sm"
              startContent={<Users height={16} width={16} />}
              variant="flat"
              onSelectionChange={(keys) => {
                const selectedKeys = Array.from(keys) as string[];

                field.onChange(selectedKeys);
              }}
            >
              {organizationMembers.map((member) => (
                <SelectItem
                  key={member.user.id}
                  textValue={`${member.user.firstName} ${member.user.lastName}`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      className="flex-shrink-0"
                      name={`${member.user.firstName} ${member.user.lastName}`}
                      size="sm"
                      src={member.user.avatar}
                    />
                    <div className="flex flex-col">
                      <span className="text-small font-medium">
                        {member.user.firstName} {member.user.lastName}
                      </span>
                      <span className="text-tiny text-default-400">
                        {member.user.email}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </Select>

            {/* Selected Members Chips */}
            {selectedMembers.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm font-medium text-default-600">
                  Assigned Members:
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedMembers.map((member) => (
                    <Chip
                      key={member.user.id}
                      avatar={
                        <Avatar
                          name={`${member.user.firstName} ${member.user.lastName}`}
                          size="sm"
                          src={member.user.avatar}
                        />
                      }
                      color="primary"
                      variant="flat"
                      onClose={() => {
                        const newValue =
                          (field.value as string[])?.filter(
                            (id: string) => id !== member.user.id
                          ) || [];

                        field.onChange(newValue);
                      }}
                    >
                      {member.user.firstName} {member.user.lastName}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }}
    />
  );
};
