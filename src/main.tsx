import "./globals.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Route, Switch } from "wouter";
import { DashboardPage } from "./dashboard/page";
import { CreateProjectPage } from "@/project/create/page";
import { ProjectPage } from "@/project/[projectId]/page.tsx";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { Layout } from "@/components/layout";
import { QueryClient, QueryClientProvider } from "react-query";
import { SchedulerPage } from "@/scheduler/page.tsx";
import { EditorPage } from "@/editor/page.tsx";
import { enableMapSet } from "immer";
import { ProjectEditorPage } from "@/project/[projectId]/edit/page.tsx";

enableMapSet();

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Layout>
          <Switch>
            <Route path="/" component={DashboardPage} />
            <Route path="/project/create" component={CreateProjectPage} />
            <Route path="/project/:projectId">
              {(params) => <ProjectPage projectId={params.projectId} />}
            </Route>
            <Route path="/project/:projectId/edit">
              {(params) => <ProjectEditorPage projectId={params.projectId} />}
            </Route>
            <Route path="/scheduler" component={SchedulerPage} />
            <Route path="/editor" component={EditorPage} />

            {/*/!* Default route in a switch *!/*/}
            <Route>404: No such page!</Route>
          </Switch>
        </Layout>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
