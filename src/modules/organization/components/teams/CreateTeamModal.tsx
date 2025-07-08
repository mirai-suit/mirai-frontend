import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Card,
  CardBody,
  Chip,
} from "@heroui/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "@phosphor-icons/react";

import { createTeamSchema } from "../../validations/team";
import { CreateTeamRequest, TEAM_COLORS } from "../../types/team";
import { useCreateTeam } from "../../api/teams";
import { useOrganizationMembers } from "../../api";
import { useBoards } from "@/modules/board/api";
import { useOrgStore } from "@/store/useOrgStore";
import { useAuthStore } from "@/modules/auth/store";

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentOrg } = useOrgStore();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);

  const createTeamMutation = useCreateTeam();
  const { data: membersResponse } = useOrganizationMembers(
    currentOrg?.id || ""
  );
  const { data: boardsResponse } = useBoards(currentOrg?.id || "");

  const members = membersResponse?.members || [];
  const boards = boardsResponse?.boards || [];

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#3B82F6",
      leaderId: user?.id || "",
      memberIds: user?.id ? [user.id] : [],
      boardIds: [],
      objectives: "",
    },
  });

  const watchedLeaderId = watch("leaderId");
  const watchedMemberIds = watch("memberIds");
  const watchedBoardIds = watch("boardIds");

  const handleClose = () => {
    reset();
    setStep(1);
    onClose();
  };

  const onSubmit = async (data: any) => {
    if (!currentOrg?.id) return;

    const teamData: CreateTeamRequest = {
      ...data,
      organizationId: currentOrg.id,
      boardIds: data.boardIds?.length ? data.boardIds : undefined,
    };

    try {
      await createTeamMutation.mutateAsync(teamData);
      handleClose();
    } catch (error) {
      console.error("Failed to create team:", error);
    }
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  // Ensure leader is always in members
  const handleLeaderChange = (leaderId: string) => {
    setValue("leaderId", leaderId);
    const currentMembers = watchedMemberIds || [];
    if (!currentMembers.includes(leaderId)) {
      setValue("memberIds", [...currentMembers, leaderId]);
    }
  };

  const handleMemberToggle = (memberId: string) => {
    const currentMembers = watchedMemberIds || [];
    const isSelected = currentMembers.includes(memberId);

    if (isSelected) {
      // Don't allow removing the leader
      if (memberId === watchedLeaderId) return;
      setValue(
        "memberIds",
        currentMembers.filter((id) => id !== memberId)
      );
    } else {
      setValue("memberIds", [...currentMembers, memberId]);
    }
  };

  const selectedMembersCount = watchedMemberIds?.length || 0;
  const selectedBoardsCount = watchedBoardIds?.length || 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Plus size={20} />
              Create New Team
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      stepNum <= step
                        ? "bg-primary text-white"
                        : "bg-default-200 text-default-500"
                    }`}
                  >
                    {stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div
                      className={`w-8 h-0.5 mx-1 ${
                        stepNum < step ? "bg-primary" : "bg-default-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </ModalHeader>

          <ModalBody>
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>

                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Team Name"
                      placeholder="Enter team name"
                      isRequired
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
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Team Members</h3>
                  <Chip size="sm" variant="flat">
                    {selectedMembersCount} selected
                  </Chip>
                </div>

                <Controller
                  name="leaderId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Team Leader"
                      placeholder="Select team leader"
                      isRequired
                      errorMessage={errors.leaderId?.message}
                      isInvalid={!!errors.leaderId}
                      onSelectionChange={(key) =>
                        handleLeaderChange(String(key))
                      }
                    >
                      {members.map((member) => (
                        <SelectItem key={member.user.id}>
                          {member.user.firstName} {member.user.lastName}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                />

                <div className="space-y-2">
                  <span className="text-sm font-medium">Team Members</span>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {members.map((member) => {
                      const isSelected = watchedMemberIds?.includes(
                        member.user.id
                      );
                      const isLeader = member.user.id === watchedLeaderId;

                      return (
                        <Card
                          key={member.user.id}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-primary-50 border-primary"
                              : "hover:bg-default-50"
                          }`}
                          isPressable
                          onPress={() => handleMemberToggle(member.user.id)}
                        >
                          <CardBody className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-4 h-4 rounded border-2 ${
                                    isSelected
                                      ? "bg-primary border-primary"
                                      : "border-default-300"
                                  }`}
                                >
                                  {isSelected && (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <div className="w-2 h-2 bg-white rounded-full" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {member.user.firstName}{" "}
                                    {member.user.lastName}
                                  </p>
                                  <p className="text-sm text-default-500">
                                    {member.user.email}
                                  </p>
                                </div>
                              </div>
                              {isLeader && (
                                <Chip size="sm" color="warning" variant="flat">
                                  Leader
                                </Chip>
                              )}
                            </div>
                          </CardBody>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Board Access (Optional)
                  </h3>
                  <Chip size="sm" variant="flat">
                    {selectedBoardsCount} selected
                  </Chip>
                </div>

                <p className="text-sm text-default-500">
                  Select boards that this team should have access to. You can
                  modify this later.
                </p>

                <Controller
                  name="boardIds"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {boards.map((board) => {
                          const isSelected = field.value?.includes(board.id);

                          return (
                            <Card
                              key={board.id}
                              className={`cursor-pointer transition-colors ${
                                isSelected
                                  ? "bg-primary-50 border-primary"
                                  : "hover:bg-default-50"
                              }`}
                              isPressable
                              onPress={() => {
                                const current = field.value || [];
                                const updated = isSelected
                                  ? current.filter((id) => id !== board.id)
                                  : [...current, board.id];
                                field.onChange(updated);
                              }}
                            >
                              <CardBody className="p-3">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-4 h-4 rounded border-2 ${
                                      isSelected
                                        ? "bg-primary border-primary"
                                        : "border-default-300"
                                    }`}
                                  >
                                    {isSelected && (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full" />
                                      </div>
                                    )}
                                  </div>
                                  <div
                                    className="w-4 h-4 rounded"
                                    style={{ backgroundColor: board.color }}
                                  />
                                  <div>
                                    <p className="font-medium">{board.title}</p>
                                    {board.description && (
                                      <p className="text-sm text-default-500 line-clamp-1">
                                        {board.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </CardBody>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}
                />
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              variant="light"
              onPress={step === 1 ? handleClose : handlePrevious}
            >
              {step === 1 ? "Cancel" : "Previous"}
            </Button>

            {step < 3 ? (
              <Button
                color="primary"
                onPress={handleNext}
                isDisabled={step === 1 && !isValid}
              >
                Next
              </Button>
            ) : (
              <Button
                color="primary"
                type="submit"
                isLoading={createTeamMutation.isPending}
              >
                Create Team
              </Button>
            )}
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
