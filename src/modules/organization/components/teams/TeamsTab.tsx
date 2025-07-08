import React, { useState } from "react";
import {
  Button,
  Input,
  Card,
  CardBody,
  Spinner,
  useDisclosure,
} from "@heroui/react";
import { Plus, MagnifyingGlass, Users } from "@phosphor-icons/react";
import { motion } from "framer-motion";

import { useOrgStore } from "@/store/useOrgStore";

import { TeamCard } from "./TeamCard";
import { CreateTeamModal } from "./CreateTeamModal";
import { EditTeamModal } from "./EditTeamModal";
import { Team } from "../../types/team";
import { useTeams } from "../../api/teams";

export const TeamsTab: React.FC = () => {
  const { currentOrg } = useOrgStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const createModal = useDisclosure();
  const editModal = useDisclosure();

  const {
    data: teamsResponse,
    isLoading,
    error,
  } = useTeams(currentOrg?.id || "");

  const teams = teamsResponse?.teams || [];

  // Filter teams based on search term
  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.leader?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.leader?.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditTeam = (team: Team) => {
    setSelectedTeamId(team.id);
    editModal.onOpen();
  };

  const handleCloseEditModal = () => {
    setSelectedTeamId(null);
    editModal.onClose();
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner size="lg" />
          <p className="text-default-500">Loading teams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-danger text-lg">Failed to load teams</p>
          <p className="text-default-500">
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Teams</h2>
          <p className="text-default-500 mt-1">
            Manage your organization&apos;s teams and their board access
          </p>
        </div>
        <Button
          color="primary"
          startContent={<Plus size={18} />}
          onPress={createModal.onOpen}
        >
          Create Team
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search teams..."
            startContent={<MagnifyingGlass size={18} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-default-500">
          <Users size={16} />
          <span className="text-sm">
            {filteredTeams.length} team{filteredTeams.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Teams Grid */}
      {filteredTeams.length === 0 ? (
        <Card className="border-dashed border-2 border-default-200">
          <CardBody className="text-center py-12">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-default-100 rounded-full flex items-center justify-center mx-auto">
                <Users size={24} className="text-default-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {searchTerm ? "No teams found" : "No teams yet"}
                </h3>
                <p className="text-default-500 mt-1">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Create your first team to get started"}
                </p>
              </div>
              {!searchTerm && (
                <Button
                  color="primary"
                  startContent={<Plus size={18} />}
                  onPress={createModal.onOpen}
                >
                  Create Team
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team, index) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <TeamCard team={team} onEdit={() => handleEditTeam(team)} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateTeamModal
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
      />

      <EditTeamModal
        isOpen={editModal.isOpen}
        onClose={handleCloseEditModal}
        teamId={selectedTeamId}
      />
    </div>
  );
};
