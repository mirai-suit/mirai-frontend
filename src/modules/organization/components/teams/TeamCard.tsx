import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Avatar,
  AvatarGroup,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  Progress,
} from "@heroui/react";
import {
  DotsThree,
  PencilSimple,
  Trash,
  Users,
  Kanban,
  TrendUp,
  Crown,
} from "@phosphor-icons/react";

import { Team } from "../../types/team";
import { useDeleteTeam } from "../../api/teams";

interface TeamCardProps {
  team: Team;
  onEdit: () => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({ team, onEdit }) => {
  const deleteTeamMutation = useDeleteTeam();

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${team.name}"?`)) {
      await deleteTeamMutation.mutateAsync(team.id);
    }
  };

  // Calculate performance metrics
  const totalMembers = team.members.length;
  const activeMembersWithMetrics = team.members.filter(
    (m) => m.performanceMetrics
  );
  const avgCompletionRate =
    activeMembersWithMetrics.length > 0
      ? activeMembersWithMetrics.reduce(
          (sum, m) => sum + (m.performanceMetrics?.completionRate || 0),
          0
        ) / activeMembersWithMetrics.length
      : 0;

  const avgProductivityScore =
    activeMembersWithMetrics.length > 0
      ? activeMembersWithMetrics.reduce(
          (sum, m) => sum + (m.performanceMetrics?.productivityScore || 0),
          0
        ) / activeMembersWithMetrics.length
      : 0;

  return (
    <Card
      className="h-full hover:shadow-lg transition-shadow duration-200"
      style={{
        borderTop: `4px solid ${team.color}`,
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start w-full">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${team.color}20` }}
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: team.color }}
              />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">
                {team.name}
              </h3>
              {team.description && (
                <p className="text-default-500 text-sm line-clamp-2">
                  {team.description}
                </p>
              )}
            </div>
          </div>

          <Dropdown>
            <DropdownTrigger>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                isLoading={deleteTeamMutation.isPending}
              >
                <DotsThree size={16} />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem
                key="edit"
                startContent={<PencilSimple size={16} />}
                onPress={onEdit}
              >
                Edit Team
              </DropdownItem>
              <DropdownItem
                key="delete"
                className="text-danger"
                color="danger"
                startContent={<Trash size={16} />}
                onPress={handleDelete}
              >
                Delete Team
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </CardHeader>

      <CardBody className="pt-0 space-y-4">
        {/* Team Leader */}
        {team.leader && (
          <div className="flex items-center gap-2">
            <Crown size={16} className="text-yellow-500" />
            <Avatar
              size="sm"
              src={team.leader.avatar}
              name={`${team.leader.firstName} ${team.leader.lastName}`}
            />
            <span className="text-sm text-foreground">
              {team.leader.firstName} {team.leader.lastName}
            </span>
            <Chip size="sm" variant="flat" color="warning">
              Leader
            </Chip>
          </div>
        )}

        {/* Members */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-default-400" />
            <span className="text-sm text-default-500">
              {totalMembers} member{totalMembers !== 1 ? "s" : ""}
            </span>
          </div>
          <AvatarGroup
            size="sm"
            max={4}
            total={totalMembers}
            className="justify-end"
          >
            {team.members.slice(0, 4).map((member) => (
              <Avatar
                key={member.id}
                src={member.user.avatar}
                name={`${member.user.firstName} ${member.user.lastName}`}
              />
            ))}
          </AvatarGroup>
        </div>

        {/* Board Access */}
        <div className="flex items-center gap-2">
          <Kanban size={16} className="text-default-400" />
          <span className="text-sm text-default-500">
            {team._count?.boardAccess || 0} board
            {(team._count?.boardAccess || 0) !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Performance Metrics */}
        {activeMembersWithMetrics.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-default-200">
            <div className="flex items-center gap-2">
              <TrendUp size={16} className="text-success" />
              <span className="text-sm font-medium text-foreground">
                Performance
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-default-500">
                  Completion Rate
                </span>
                <span className="text-xs font-medium">
                  {avgCompletionRate.toFixed(1)}%
                </span>
              </div>
              <Progress
                size="sm"
                value={avgCompletionRate}
                color={
                  avgCompletionRate >= 80
                    ? "success"
                    : avgCompletionRate >= 60
                      ? "warning"
                      : "danger"
                }
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-default-500">
                  Productivity Score
                </span>
                <span className="text-xs font-medium">
                  {avgProductivityScore.toFixed(1)}
                </span>
              </div>
              <Progress
                size="sm"
                value={avgProductivityScore}
                color={
                  avgProductivityScore >= 80
                    ? "success"
                    : avgProductivityScore >= 60
                      ? "warning"
                      : "danger"
                }
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Objectives */}
        {team.objectives && (
          <div className="pt-2 border-t border-default-200">
            <p className="text-xs text-default-500 mb-1">Objectives:</p>
            <p className="text-sm text-foreground line-clamp-3">
              {team.objectives}
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
