import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";

type ActionFn<T, Args extends any[]> = (...args: Args) => Promise<T>;

interface UseOptimisticActionOptions<State, Args extends any[]> {
  initialState: State;
  reducer: (state: State, ...args: Args) => State;
  action: ActionFn<any, Args>;
  onSuccess?: () => void;
  onError?: (error: any) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useOptimisticAction<State, Args extends any[]>({
  initialState,
  reducer,
  action,
  onSuccess,
  onError,
  successMessage,
  errorMessage = "Something went wrong. Please try again.",
}: UseOptimisticActionOptions<State, Args>) {
  const [optimisticState, addOptimistic] = useOptimistic<State, Args>(
    initialState,
    (state, payload) => reducer(state, ...payload as unknown as Args)
  );
  const [isPending, startTransition] = useTransition();

  const execute = async (...args: Args) => {
    startTransition(async () => {
      // @ts-ignore
      addOptimistic(args);
      try {
        await action(...args);
        if (successMessage) toast.success(successMessage);
        onSuccess?.();
      } catch (error) {
        console.error("Action error:", error);
        toast.error(errorMessage);
        onError?.(error);
      }
    });
  };

  return { optimisticState, execute, isPending };
}
