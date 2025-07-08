import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Tabs,
  Tab,
} from "@heroui/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilSimple } from "@phosphor-icons/react";

import { updateTeamSchema, UpdateTeamInput } from "../../validations/team";
import { Team, UpdateTeamRequest, TEAM_COLORS } from "../../types/team";
import { useUpdateTeam } from "../../api/teams";

interface EditTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
}

export const EditTeamModal: React.FC<EditTeamModalProps> = ({
  isOpen,
  onClose,
  team,
}) => {
  const updateTeamMutation = useUpdateTeam();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdateTeamInput>({
    resolver: zodResolver(updateTeamSchema),
    defaultValues: {
      name: team?.name || "",
      description: team?.description || "",
      color: team?.color || "#3B82F6",
      objectives: team?.objectives || "",
    },
  });

  // Reset form when team changes
  React.useEffect(() => {
    if (team) {
      reset({
        name: team.name,
        description: team.description || "",
        color: team.color,
        objectives: team.objectives || "",
      });
    }
  }, [team, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: UpdateTeamInput) => {
    if (!team) return;

    const updateData: UpdateTeamRequest = {
      ...data,
    };

    try {
      await updateTeamMutation.mutateAsync({
        teamId: team.id,
        data: updateData,
      });
      handleClose();
    } catch (error) {
      console.error("Failed to update team:", error);
    }
  };

  if (!team) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader className="flex items-center gap-2">
            <PencilSimple size={20} />
            Edit Team - {team.name}
          </ModalHeader>

          <ModalBody>
            <Tabs aria-label="Team edit options" className="w-full">
              <Tab key="details" title="Details">
                <div className="space-y-4 py-4">
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Team Name"
                        placeholder="Enter team name"
                        errorMessage={errors.name?.message}
                        isInvalid={!!errors.name}
                      />
                    )}
                  />

                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        label="Description"
                        placeholder="Describe the team's purpose and goals"
                        maxRows={3}
                        errorMessage={errors.description?.message}
                        isInvalid={!!errors.description}
                      />
                    )}
                  />

                  <Controller
                    name="color"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <span className="text-sm font-medium">Team Color</span>
                        <div className="flex gap-2 flex-wrap">
                          {TEAM_COLORS.map((color) => (
                            <button
                              key={color}
                              type="button"
                              className={`w-8 h-8 rounded-full border-2 ${
                                field.value === color
                                  ? "border-foreground"
                                  : "border-default-200"
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() => field.onChange(color)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  />

                  <Controller
                    name="objectives"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        label="Objectives"
                        placeholder="What are the team's main objectives?"
                        maxRows={3}
                        errorMessage={errors.objectives?.message}
                        isInvalid={!!errors.objectives}
                      />
                    )}
                  />
                </div>
              </Tab>

              <Tab key="members" title="Members">
                <div className="space-y-4 py-4">
                  <p className="text-sm text-default-500">
                    Member management will be implemented in the next iteration.
                  </p>
                  <div className="space-y-2">
                    {team.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-default-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {member.user.firstName} {member.user.lastName}
                          </p>
                          <p className="text-sm text-default-500">
                            {member.user.email}
                          </p>
                        </div>
                        <div className="text-sm text-default-500">
                          {member.role}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Tab>

              <Tab key="boards" title="Board Access">
                <div className="space-y-4 py-4">
                  <p className="text-sm text-default-500">
                    Board access management will be implemented in the next
                    iteration.
                  </p>
                  <div className="space-y-2">
                    {team.boardAccess.map((access) => (
                      <div
                        key={access.id}
                        className="flex items-center gap-3 p-3 bg-default-50 rounded-lg"
                      >
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: access.board.color }}
                        />
                        <div>
                          <p className="font-medium">{access.board.title}</p>
                          {access.board.description && (
                            <p className="text-sm text-default-500 line-clamp-1">
                              {access.board.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Tab>
            </Tabs>
          </ModalBody>

          <ModalFooter>
            <Button variant="light" onPress={handleClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              type="submit"
              isLoading={updateTeamMutation.isPending}
              isDisabled={!isDirty}
            >
              Save Changes
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
