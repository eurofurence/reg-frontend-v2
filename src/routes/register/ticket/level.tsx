import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import RadioCard from "../../../components/controls/RadioCard";
import RadioGroup from "../../../components/controls/RadioGroup";
import FullWidthRegisterFunnelLayout from "../../../components/funnels/FullWidthRegisterFunnelLayout";
import ticketLevels from "../../../data/ticketLevels";
import registrationApi from "../../../db/registration";

export const Route = createFileRoute("/register/ticket/level")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const reg = registrationApi.get(queryClient) ?? {};

  const { register, handleSubmit, reset } = useForm({ defaultValues: reg });
  const navigate = useNavigate();

  useEffect(() => reset(reg), [reg, reset]);

  const onSubmit = (data: any) => {
    registrationApi.update(queryClient, { ...data });
    navigate({ to: "/register/personal-info" as any });
  };

  return (
    <FullWidthRegisterFunnelLayout currentStep={1}>
      <h3>Select ticket level</h3>
      <form id="ticket-level-form" onSubmit={handleSubmit(onSubmit)}>
        <RadioGroup name="level">
          {ticketLevels.map((level) => (
            <RadioCard
              key={level.id}
              label={`${level.label} — full: ${level.prices.full}€ day: ${level.prices.day}€`}
            >
              <label>
                <input
                  type="radio"
                  value={level.id}
                  {...register("level", { required: true })}
                />
              </label>
            </RadioCard>
          ))}
        </RadioGroup>

        <button
          type="button"
          onClick={() =>
            navigate({
              to: (reg.type === "day"
                ? "/register/ticket/day"
                : "/register/ticket/type") as any,
            })
          }
        >
          Back
        </button>
        <button type="submit">Next</button>
      </form>
    </FullWidthRegisterFunnelLayout>
  );
}
