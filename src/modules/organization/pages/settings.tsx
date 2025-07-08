import React from "react";
import { Card, CardBody, CardHeader, Tabs, Tab } from "@heroui/react";
import { useParams } from "react-router-dom";
import {
  Gear,
  Users,
  Shield,
  Notification,
  UsersThree,
} from "@phosphor-icons/react";

import { MembersManagement } from "../components/members-management";
import { BoardAccessManagement } from "../components/board-access-management";
import { TeamsTab } from "../components/teams/TeamsTab";

import { WithPermission } from "@/components/role-based-access";

export const OrganizationSettingsPage: React.FC = () => {
  const { orgId } = useParams();
  const [selectedTab, setSelectedTab] = React.useState("members");

  if (!orgId) {
    return (
      <div className="p-6">
        <Card>
          <CardBody>
            <p className="text-danger">Organization not found.</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Organization Settings</h1>
        <p className="text-default-500">
          Manage your organization preferences, members, and security settings.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <Tabs
            className="w-full"
            selectedKey={selectedTab}
            variant="underlined"
            onSelectionChange={(key) => setSelectedTab(key as string)}
          >
            <Tab
              key="general"
              title={
                <div className="flex items-center gap-2">
                  <Gear size={18} />
                  <span>General</span>
                </div>
              }
            />
            <Tab
              key="members"
              title={
                <div className="flex items-center gap-2">
                  <Users size={18} />
                  <span>Members</span>
                </div>
              }
            />
            <Tab
              key="teams"
              title={
                <div className="flex items-center gap-2">
                  <UsersThree size={18} />
                  <span>Teams</span>
                </div>
              }
            />
            <Tab
              key="security"
              title={
                <div className="flex items-center gap-2">
                  <Shield size={18} />
                  <span>Security</span>
                </div>
              }
            />
            <Tab
              key="notifications"
              title={
                <div className="flex items-center gap-2">
                  <Notification size={18} />
                  <span>Notifications</span>
                </div>
              }
            />
            <Tab
              key="board-access"
              title={
                <div className="flex items-center gap-2">
                  <Shield size={18} />
                  <span>Board Access</span>
                </div>
              }
            />
          </Tabs>
        </CardHeader>

        <CardBody className="pt-6">
          {selectedTab === "general" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">General Settings</h3>
                <p className="text-default-500">
                  General organization settings will be implemented here.
                </p>
              </div>
            </div>
          )}

          {selectedTab === "members" && (
            <WithPermission
              fallback={
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
                  <p className="text-default-500">
                    You don&apos;t have permission to manage organization
                    members.
                  </p>
                </div>
              }
              permission="inviteUsers"
            >
              <MembersManagement organizationId={orgId} />
            </WithPermission>
          )}

          {selectedTab === "teams" && (
            <WithPermission
              fallback={
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
                  <p className="text-default-500">
                    You don&apos;t have permission to manage teams.
                  </p>
                </div>
              }
              permission="createBoards"
            >
              <TeamsTab />
            </WithPermission>
          )}

          {selectedTab === "security" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Security Settings
                </h3>
                <p className="text-default-500">
                  Security settings will be implemented here.
                </p>
              </div>
            </div>
          )}

          {selectedTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Notification Settings
                </h3>
                <p className="text-default-500">
                  Notification preferences will be implemented here.
                </p>
              </div>
            </div>
          )}

          {selectedTab === "board-access" && (
            <WithPermission
              permission="accessAllBoards"
              fallback={
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
                  <p className="text-default-500">
                    You don&apos;t have permission to manage board access.
                  </p>
                </div>
              }
            >
              <BoardAccessManagement organizationId={orgId} />
            </WithPermission>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
