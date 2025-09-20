import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import RadioCard from "../../../components/controls/RadioCard";
import RadioGroup from "../../../components/controls/RadioGroup";
import FullWidthRegisterFunnelLayout from "../../../components/funnels/FullWidthRegisterFunnelLayout";
import registrationApi from "../../../db/registration";

export const Route = createFileRoute("/register/ticket/type")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const reg = registrationApi.get(queryClient) ?? {};

  const { register, handleSubmit, reset } = useForm({
    defaultValues: reg,
  });
  const navigate = useNavigate();

  // when store changes, reset form values
  const prevRef = React.useRef<any>(null);
  useEffect(() => {
    // only reset when registration data actually changed to avoid render loops
    try {
      const prev = prevRef.current;
      if (JSON.stringify(prev) !== JSON.stringify(reg)) {
        prevRef.current = reg;
        reset(reg);
      }
    } catch (e) {
      prevRef.current = reg;
      reset(reg);
    }
  }, [reg, reset]);

  const onSubmit = (data: any) => {
    registrationApi.update(queryClient, { ...data });
    if (data.type === "day") navigate({ to: "/register/ticket/day" as any });
    else navigate({ to: "/register/ticket/level" as any });
  };

  return (
    <FullWidthRegisterFunnelLayout currentStep={0}>
      <h3>Select your ticket</h3>
      <form id="ticket-type-form" onSubmit={handleSubmit(onSubmit)}>
        <RadioGroup name="type">
          <RadioCard label="Full convention">
            <label>
              <input
                type="radio"
                value="full"
                {...register("type", { required: true })}
              />{" "}
              Full
            </label>
          </RadioCard>

          <RadioCard label="Day ticket">
            <label>
              <input
                type="radio"
                value="day"
                {...register("type", { required: true })}
              />{" "}
              Day
            </label>
          </RadioCard>
        </RadioGroup>

        <button type="submit">Next</button>
      </form>
    </FullWidthRegisterFunnelLayout>
  );
}
