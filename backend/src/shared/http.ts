import type { FastifyReply } from "fastify";

interface SuccessEnvelope<T> {
  success: true;
  data: T;
  traceId: string;
}

interface ErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  traceId: string;
}

export const sendSuccess = <T>(reply: FastifyReply, traceId: string, data: T, statusCode = 200) => {
  const payload: SuccessEnvelope<T> = {
    success: true,
    data,
    traceId
  };

  return reply.status(statusCode).send(payload);
};

export const sendError = (
  reply: FastifyReply,
  traceId: string,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown
) => {
  const payload: ErrorEnvelope = {
    success: false,
    error: {
      code,
      message,
      details
    },
    traceId
  };

  return reply.status(statusCode).send(payload);
};
