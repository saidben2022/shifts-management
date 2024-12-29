import React from 'react';
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Worker } from "@/types/Worker";
import { Shift } from "@/types/Shift";
import { Users, Clock, Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkerStatusCardsProps {
  workers: Worker[];
  shifts: Shift[];
  currentPeriodDates: {
    start: Date;
    end: Date;
  };
}

export function WorkerStatusCards({ workers, shifts, currentPeriodDates }: WorkerStatusCardsProps) {
  const { t } = useTranslation();
  const activeWorkers = workers.filter(worker => worker.isActive);
  const workingToday = shifts.filter(shift => 
    new Date(shift.startTime).toDateString() === new Date().toDateString()
  ).length;

  const cards = [
    {
      title: t('workers.title'),
      value: activeWorkers.length,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-100',
      iconColor: 'text-blue-200',
      metric: 'Active workers',
    },
    {
      title: t('workers.status.notWorking'),
      value: activeWorkers.length - workingToday,
      icon: Clock,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-100',
      iconColor: 'text-purple-200',
      metric: 'Not scheduled today',
    },
    {
      title: t('workers.status.leavePeriod'),
      value: `${currentPeriodDates.start.toLocaleDateString()} ${t('workers.status.to')} ${currentPeriodDates.end.toLocaleDateString()}`,
      icon: Calendar,
      color: 'from-emerald-500 to-emerald-600',
      textColor: 'text-emerald-100',
      iconColor: 'text-emerald-200',
      metric: 'Current period',
      isDate: true,
    },
    {
      title: t('workers.status.location'),
      value: 'Amsterdam',
      icon: MapPin,
      color: 'from-orange-500 to-orange-600',
      textColor: 'text-orange-100',
      iconColor: 'text-orange-200',
      metric: 'Main office',
      isLocation: true,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card 
          key={index}
          className={cn(
            "relative overflow-hidden bg-gradient-to-br",
            card.color,
            "border-none shadow-lg hover:shadow-xl transition-shadow"
          )}
        >
          <div className="absolute top-0 right-0 p-3">
            <card.icon className={cn("w-12 h-12 opacity-20", card.iconColor)} />
          </div>
          <div className="p-6">
            <h3 className={cn("text-sm font-medium", card.textColor)}>
              {card.title}
            </h3>
            <div className={cn("mt-2 flex items-baseline", card.textColor)}>
              <div className="flex flex-col">
                <span className={cn(
                  "text-2xl font-bold",
                  card.isDate ? "text-lg" : "text-3xl"
                )}>
                  {card.value}
                </span>
                <span className="text-sm mt-1 opacity-80">
                  {card.metric}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
