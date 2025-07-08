import React, { useEffect } from "react";
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
  Divider,
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
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      color: "#3B82F6",
      leaderId: "",
      memberIds: [],
      boardIds: [],
      objectives: "",
    },
  });

  const watchedLeaderId = watch("leaderId");
  const watchedMemberIds = watch("memberIds");
  const watchedBoardIds = watch("boardIds");

  // Clean up memberIds whenever they change
  useEffect(() => {
    if (Array.isArray(watchedMemberIds)) {
      const cleanIds = watchedMemberIds
        .map((id: any) => {
          if (typeof id === "string") return id;
          if (
            id &&
            typeof id === "object" &&
            typeof id.toString === "function"
          ) {
            console.warn("Converting object to string in memberIds:", id);
            return String(id);
          }
          console.warn("Invalid memberIds entry:", id, typeof id);
          return null;
        })
        .filter(
          (id): id is string =>
            typeof id === "string" &&
            id.trim() !== "" &&
            id !== "[object Set]" &&
            id !== "[object Object]" &&
            /^[a-fA-F0-9-]{36}$/.test(id)
        );

      if (
        cleanIds.length !== watchedMemberIds.length ||
        JSON.stringify(cleanIds) !== JSON.stringify(watchedMemberIds)
      ) {
        console.log("Cleaning memberIds:", {
          before: watchedMemberIds,
          after: cleanIds,
          invalidEntries: watchedMemberIds.filter(
            (id) => !cleanIds.includes(String(id))
          ),
        });
        setValue("memberIds", cleanIds);
      }
    } else if (watchedMemberIds !== undefined && watchedMemberIds !== null) {
      console.warn(
        "memberIds is not an array:",
        watchedMemberIds,
        typeof watchedMemberIds
      );
      setValue("memberIds", []);
    }
  }, [watchedMemberIds, setValue]);

  // Ensure leader is always in memberIds
  useEffect(() => {
    if (watchedLeaderId && Array.isArray(watchedMemberIds)) {
      const validMemberIds = watchedMemberIds.filter(
        (id) =>
          typeof id === "string" &&
          id.trim() !== "" &&
          /^[a-fA-F0-9-]{36}$/.test(id)
      );

      if (!validMemberIds.includes(watchedLeaderId)) {
        console.log("Adding leader to memberIds:", watchedLeaderId);
        setValue("memberIds", [...validMemberIds, watchedLeaderId]);
      }
    }
  }, [watchedLeaderId, watchedMemberIds, setValue]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: any) => {
    if (!currentOrg?.id) {
      console.error("No organization ID available");
      return;
    }

    console.log("Raw form data before processing:", {
      memberIds: data.memberIds,
      memberIdsType: typeof data.memberIds,
      memberIdsIsArray: Array.isArray(data.memberIds),
      leaderId: data.leaderId,
    });

    // Clean and validate memberIds
    let cleanMemberIds: string[] = [];

    if (Array.isArray(data.memberIds)) {
      cleanMemberIds = data.memberIds
        .map((id: any) => {
          if (typeof id === "string") return id;
          console.warn("Non-string ID found:", id, typeof id);
          return String(id);
        })
        .filter(
          (id: string) =>
            id.trim() !== "" &&
            id !== "[object Set]" &&
            id !== "[object Object]" &&
            /^[a-fA-F0-9-]{36}$/.test(id)
        );
    } else if (data.memberIds) {
      console.warn("memberIds is not an array:", data.memberIds);
    }

    // Ensure leader is in memberIds
    if (data.leaderId && !cleanMemberIds.includes(data.leaderId)) {
      cleanMemberIds.push(data.leaderId);
    }

    console.log("Processed memberIds:", cleanMemberIds);

    const teamData: CreateTeamRequest = {
      ...data,
      organizationId: currentOrg.id,
      memberIds: cleanMemberIds,
      boardIds: data.boardIds?.length ? data.boardIds : undefined,
    };

    console.log("Final team data being submitted:", teamData);

    try {
      await createTeamMutation.mutateAsync(teamData);
      handleClose();
    } catch (error) {
      console.error("Failed to create team:", error);
    }
  };

  const handleLeaderChange = (leaderId: string) => {
    console.log("handleLeaderChange called with:", leaderId, typeof leaderId);

    setValue("leaderId", leaderId);

    const currentMembers = watchedMemberIds || [];
    const currentLeaderId = watchedLeaderId;

    console.log("Leader change - current state:", {
      currentMembers,
      currentLeaderId,
      newLeaderId: leaderId,
    });

    let updatedMembers = currentMembers.filter((id) => {
      const isValid =
        typeof id === "string" &&
        id.trim() !== "" &&
        /^[a-fA-F0-9-]{36}$/.test(id);
      const isNotOldLeader = id !== currentLeaderId;

      if (!isValid) {
        console.warn(
          "Filtering out invalid member ID during leader change:",
          id,
          typeof id
        );
      }

      return isValid && isNotOldLeader;
    });

    if (!updatedMembers.includes(leaderId)) {
      updatedMembers.push(leaderId);
    }

    console.log("Leader change - final memberIds:", updatedMembers);
    setValue("memberIds", updatedMembers);
  };

  const handleMemberToggle = (memberId: string) => {
    console.log("handleMemberToggle called with:", memberId, typeof memberId);

    const currentMembers = watchedMemberIds || [];
    console.log("Current members before toggle:", currentMembers);

    const validMembers = currentMembers.filter((id) => {
      const isValid =
        typeof id === "string" &&
        id.trim() !== "" &&
        /^[a-fA-F0-9-]{36}$/.test(id);
      if (!isValid) {
        console.warn("Filtering out invalid member ID:", id, typeof id);
      }
      return isValid;
    });

    const isSelected = validMembers.includes(memberId);
    console.log("Member selection state:", {
      memberId,
      isSelected,
      validMembers,
    });

    if (isSelected) {
      if (memberId === watchedLeaderId) {
        console.log("Cannot remove leader from members");
        return;
      }
      const newMembers = validMembers.filter((id) => id !== memberId);
      console.log("Removing member, new array:", newMembers);
      setValue("memberIds", newMembers);
    } else {
      const newMembers = [...validMembers, memberId];
      console.log("Adding member, new array:", newMembers);
      setValue("memberIds", newMembers);
    }
  };

  const selectedMembersCount = Array.isArray(watchedMemberIds)
    ? watchedMemberIds.filter((id) => typeof id === "string").length
    : 0;
  const selectedBoardsCount = watchedBoardIds?.length || 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="4xl"
      scrollBehavior="inside"
      classNames={{
        base: "z-50",
        backdrop: "z-40",
        wrapper: "z-50 w-full h-full flex items-center justify-center p-4",
      }}
    >
      <ModalContent className="flex flex-col h-full">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col h-full"
        >
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Plus size={20} />
              Create New Team
            </div>
            <p className="text-sm text-default-500 font-normal">
              Create a new team by filling out the information below
            </p>
          </ModalHeader>

          <ModalBody className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <Chip size="sm" variant="flat" color="primary">
                  Required
                </Chip>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                              field.value === color
                                ? "border-foreground scale-110"
                                : "border-default-200 hover:border-default-400"
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => field.onChange(color)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                />
              </div>

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

            <Divider />

            {/* Team Members Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Team Members</h3>
                  <Chip size="sm" variant="flat" color="primary">
                    Required
                  </Chip>
                </div>
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
                    onSelectionChange={(key) => handleLeaderChange(String(key))}
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
                <span className="text-sm font-medium">
                  Additional Team Members
                </span>
                <p className="text-xs text-default-500">
                  Select additional members for this team (leader is
                  automatically included)
                </p>
                <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-2">
                  {members
                    .filter((member) => member.user.id !== watchedLeaderId)
                    .map((member) => {
                      const isSelected =
                        Array.isArray(watchedMemberIds) &&
                        watchedMemberIds
                          .filter((id) => typeof id === "string")
                          .includes(member.user.id);

                      return (
                        <Card
                          key={member.user.id}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-primary-50 border-primary"
                              : "hover:bg-default-50"
                          }`}
                          isPressable
                          shadow="sm"
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
                            </div>
                          </CardBody>
                        </Card>
                      );
                    })}

                  {/* Show leader separately */}
                  {watchedLeaderId &&
                    members.find((m) => m.user.id === watchedLeaderId) && (
                      <Card className="bg-warning-50 border-warning" shadow="sm">
                        <CardBody className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded border-2 bg-warning border-warning">
                                <div className="w-full h-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full" />
                                </div>
                              </div>
                              <div>
                                <p className="font-medium">
                                  {
                                    members.find(
                                      (m) => m.user.id === watchedLeaderId
                                    )?.user.firstName
                                  }{" "}
                                  {
                                    members.find(
                                      (m) => m.user.id === watchedLeaderId
                                    )?.user.lastName
                                  }
                                </p>
                                <p className="text-sm text-default-500">
                                  {
                                    members.find(
                                      (m) => m.user.id === watchedLeaderId
                                    )?.user.email
                                  }
                                </p>
                              </div>
                            </div>
                            <Chip size="sm" color="warning" variant="flat">
                              Leader
                            </Chip>
                          </div>
                        </CardBody>
                      </Card>
                    )}
                </div>
              </div>
            </div>

            <Divider />

            {/* Board Access Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Board Access</h3>
                  <Chip size="sm" variant="flat" color="default">
                    Optional
                  </Chip>
                </div>
                <Chip size="sm" variant="flat">
                  {selectedBoardsCount} selected
                </Chip>
              </div>

              {boards.length > 0 ? (
                <>
                  <p className="text-sm text-default-500">
                    Select boards that this team should have access to. You can
                    modify this later in team settings.
                  </p>

                  <Controller
                    name="boardIds"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-2">
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
                                shadow="sm"
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
                                      <p className="font-medium">
                                        {board.title}
                                      </p>
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
                </>
              ) : (
                <div className="text-center py-8 border rounded-lg bg-default-50">
                  <div className="text-default-400 mb-2">
                    <svg
                      className="w-12 h-12 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-default-500 mb-1">No boards available</p>
                  <p className="text-sm text-default-400">
                    Create some boards first to assign them to teams
                  </p>
                </div>
              )}
            </div>
          </ModalBody>

          <ModalFooter className="flex-shrink-0">
            <Button variant="light" onPress={handleClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              type="submit"
              isLoading={createTeamMutation.isPending}
              isDisabled={!isValid}
            >
              Create Team
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
