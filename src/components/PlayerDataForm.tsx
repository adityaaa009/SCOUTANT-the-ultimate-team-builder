import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AGENT_ROLES, PlayerData } from "@/lib/agentAnalysis";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface PlayerDataFormProps {
  onSubmit: (data: PlayerData) => void;
}

const PlayerDataForm: React.FC<PlayerDataFormProps> = ({ onSubmit }) => {
  const form = useForm<PlayerData>({
    defaultValues: {
      Agent: "Jett",
      "Rounds Played": 20,
      ACS: 250,
      ADR: 140,
      "K:D": 1.2,
      KAST: "75%"
    }
  });

  const agents = Object.keys(AGENT_ROLES).sort();

  const handleSubmit = (data: PlayerData) => {
    // Ensure KAST is in percentage format
    if (!data.KAST.includes('%')) {
      data.KAST = `${data.KAST}%`;
    }
    
    onSubmit(data);
    toast.success(`Added data for ${data.Agent}`);
    
    // Reset form but keep the agent selection
    const currentAgent = data.Agent;
    form.reset({
      Agent: currentAgent,
      "Rounds Played": 20,
      ACS: 250,
      ADR: 140,
      "K:D": 1.2,
      KAST: "75%"
    });
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-bold mb-4">Add Player Data</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="Agent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agent</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                    >
                      {agents.map((agent) => (
                        <option key={agent} value={agent}>
                          {agent} ({AGENT_ROLES[agent]})
                        </option>
                      ))}
                    </select>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Rounds Played"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rounds Played</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ACS"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ACS</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ADR"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ADR</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="K:D"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>K:D Ratio</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="KAST"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>KAST %</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="75%" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="bg-red-500 hover:bg-red-600 w-full">
            Add Entry
          </Button>
        </form>
      </Form>
    </Card>
  );
};

export default PlayerDataForm;
