import type { Message } from "../types";

import React from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { ArrowBendDoubleUpLeft, X } from "@phosphor-icons/react";

interface ReplyPreviewProps {
  message: Message;
  onClear: () => void;
}

export const ReplyPreview: React.FC<ReplyPreviewProps> = ({
  message,
  onClear,
}) => {
  return (
    <Card className="bg-default-100" shadow="none">
      <CardBody className="px-3 py-2">
        <div className="flex items-start gap-2">
          <ArrowBendDoubleUpLeft size={16} className="text-default-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-default-600">
              Replying to {message.sender.firstName} {message.sender.lastName}
            </p>
            <p className="text-sm text-default-500 truncate mt-1">
              {message.text}
            </p>
          </div>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={onClear}
            className="text-default-400 hover:text-default-600"
          >
            <X size={14} />
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};
