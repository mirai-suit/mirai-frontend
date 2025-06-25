import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Spinner,
  Avatar,
  Chip,
} from "@heroui/react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Users, ArrowRight } from "@phosphor-icons/react";

import { useInvitationDetails, useAcceptInvitation } from "../api";
import { getRoleColor } from "../validations";

import { useAuthStore } from "@/modules/auth/store";

export const AcceptInvitationPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const {
    data: invitationResponse,
    isLoading: isLoadingInvitation,
    error: invitationError,
  } = useInvitationDetails(token || "");

  const invitation = invitationResponse?.invitation;

  const {
    mutate: acceptInvitation,
    isPending: isAccepting,
    error: acceptError,
    isSuccess: isAccepted,
  } = useAcceptInvitation();

  const handleAcceptInvitation = () => {
    if (!token) return;

    acceptInvitation(token, {
      onSuccess: (data) => {
        // Redirect to organization dashboard after successful acceptance
        if (data.organization?.id && user?.id) {
          navigate(`/u/${user.id}/o/${data.organization.id}`);
        } else {
          // If not logged in, redirect to login with return URL
          navigate(`/login?redirect=/invite/${token}`);
        }
      },
    });
  };

  const handleLogin = () => {
    navigate(`/login?redirect=/invite/${token}`);
  };

  const handleRegister = () => {
    navigate(`/register?redirect=/invite/${token}`);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardBody className="text-center">
            <XCircle className="text-danger mx-auto mb-4" size={48} />
            <h2 className="text-xl font-semibold mb-2">Invalid Invitation</h2>
            <p className="text-default-500">
              The invitation link is invalid or missing.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (isLoadingInvitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardBody className="text-center py-12">
            <Spinner className="mb-4" size="lg" />
            <p className="text-default-500">Loading invitation details...</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (invitationError || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardBody className="text-center">
            <XCircle className="text-danger mx-auto mb-4" size={48} />
            <h2 className="text-xl font-semibold mb-2">Invitation Error</h2>
            <p className="text-default-500 mb-4">
              {invitationError?.message ||
                "This invitation is invalid, expired, or has already been used."}
            </p>
            <Button
              color="primary"
              variant="flat"
              onPress={() => navigate("/")}
            >
              Go to Home
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (isAccepted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-green-50 to-emerald-100">
        <Card className="w-full max-w-md">
          <CardBody className="text-center">
            <CheckCircle className="text-success mx-auto mb-4" size={48} />
            <h2 className="text-xl font-semibold mb-2">Invitation Accepted!</h2>
            <p className="text-default-500 mb-4">
              You have successfully joined{" "}
              <strong>{invitation.organization.name}</strong>.
            </p>
            <Button
              color="success"
              endContent={<ArrowRight size={16} />}
              onPress={() => {
                if (user?.id && invitation.organization.id) {
                  navigate(`/u/${user.id}/o/${invitation.organization.id}`);
                } else {
                  navigate("/");
                }
              }}
            >
              Go to Organization
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center pb-2">
          <div className="w-full">
            <Avatar
              showFallback
              className="w-16 h-16 mx-auto mb-4"
              name={invitation.organization.name}
            />
            <h1 className="text-2xl font-bold mb-2">You&apos;re Invited!</h1>
            <p className="text-default-500">
              {invitation.invitedBy.firstName} {invitation.invitedBy.lastName}{" "}
              has invited you to join{" "}
              <strong>{invitation.organization.name}</strong>
            </p>
          </div>
        </CardHeader>

        <CardBody className="pt-2">
          <div className="space-y-4">
            {/* Invitation Details */}
            <div className="bg-default-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Users className="text-default-400" size={20} />
                  <span className="font-medium">Organization Role</span>
                </div>
                <Chip
                  color={getRoleColor(invitation.role)}
                  size="sm"
                  variant="flat"
                >
                  {invitation.role}
                </Chip>
              </div>
              <p className="text-sm text-default-500">
                You&apos;ll be added as a {invitation.role.toLowerCase()} with
                appropriate permissions for the organization.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {user ? (
                // User is logged in - can accept directly
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    color="primary"
                    isLoading={isAccepting}
                    size="lg"
                    onPress={handleAcceptInvitation}
                  >
                    {isAccepting ? "Accepting..." : "Accept Invitation"}
                  </Button>
                  {acceptError && (
                    <p className="text-danger text-sm text-center">
                      {acceptError.message ||
                        "Failed to accept invitation. Please try again."}
                    </p>
                  )}
                </div>
              ) : (
                // User is not logged in - show login/register options
                <div className="space-y-3">
                  <p className="text-sm text-center text-default-500">
                    Please log in or create an account to accept this
                    invitation.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      color="primary"
                      variant="flat"
                      onPress={handleLogin}
                    >
                      Log In
                    </Button>
                    <Button
                      className="flex-1"
                      color="primary"
                      onPress={handleRegister}
                    >
                      Sign Up
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Information */}
            <div className="text-xs text-default-400 text-center">
              <p>
                This invitation was sent to <strong>{invitation.email}</strong>
              </p>
              <p>
                Expires on {new Date(invitation.expiresAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
