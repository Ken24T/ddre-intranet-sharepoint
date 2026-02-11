/**
 * TemplatePickerDialog — Dialog for choosing a saved budget template
 * to apply to the current editor.
 *
 * Lists templates with name, line-item count, and creation date.
 * Selecting one closes the dialog and emits the chosen template.
 */

import * as React from "react";
import {
  Dialog,
  DialogType,
  DialogFooter,
  DefaultButton,
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  Selection,
  Icon,
  IconButton,
  MessageBar,
  MessageBarType,
  Spinner,
  SpinnerSize,
  Text,
} from "@fluentui/react";
import type { IColumn } from "@fluentui/react";
import type { BudgetTemplate } from "../models/types";
import type { IBudgetTemplateService } from "../services/IBudgetTemplateService";

// ─── Props ──────────────────────────────────────────────────

export interface ITemplatePickerDialogProps {
  isOpen: boolean;
  onDismiss: () => void;
  onApply: (template: BudgetTemplate) => void;
  templateService: IBudgetTemplateService;
}

// ─── Row shape ──────────────────────────────────────────────

interface ITemplateRow {
  key: string;
  id: number;
  name: string;
  description: string;
  lineItemCount: number;
  createdAt: string;
  _template: BudgetTemplate;
}

// ─── Component ─────────────────────────────────────────────

export const TemplatePickerDialog: React.FC<ITemplatePickerDialogProps> = ({
  isOpen,
  onDismiss,
  onApply,
  templateService,
}) => {
  const [templates, setTemplates] = React.useState<BudgetTemplate[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>(undefined);

  // Load templates when dialog opens
  React.useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    const load = async (): Promise<void> => {
      setIsLoading(true);
      setError(undefined);
      try {
        const list = await templateService.getTemplates();
        if (!cancelled) setTemplates(list);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load templates",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load(); // eslint-disable-line @typescript-eslint/no-floating-promises
    return (): void => {
      cancelled = true;
    };
  }, [isOpen, templateService]);

  const handleDelete = React.useCallback(
    async (id: number): Promise<void> => {
      try {
        await templateService.deleteTemplate(id);
        setTemplates((prev) => prev.filter((t) => t.id !== id));
      } catch {
        setError("Failed to delete template.");
      }
    },
    [templateService],
  );

  const rows: ITemplateRow[] = React.useMemo(
    () =>
      templates.map((t) => ({
        key: String(t.id),
        id: t.id!,
        name: t.name,
        description: t.description ?? "",
        lineItemCount: t.lineItems.length,
        createdAt: new Date(t.createdAt).toLocaleDateString("en-AU"),
        _template: t,
      })),
    [templates],
  );

  const columns: IColumn[] = React.useMemo(
    () => [
      {
        key: "name",
        name: "Template",
        fieldName: "name",
        minWidth: 160,
        maxWidth: 260,
        isResizable: true,
        onRender: (item: ITemplateRow): JSX.Element => (
          <div>
            <Text variant="medium" style={{ fontWeight: 600 }}>
              {item.name}
            </Text>
            {item.description && (
              <Text
                variant="tiny"
                block
                style={{ color: "#605e5c", marginTop: 2 }}
              >
                {item.description}
              </Text>
            )}
          </div>
        ),
      },
      {
        key: "lineItemCount",
        name: "Items",
        fieldName: "lineItemCount",
        minWidth: 50,
        maxWidth: 60,
        isResizable: false,
        onRender: (item: ITemplateRow): JSX.Element => (
          <Text variant="small">{item.lineItemCount}</Text>
        ),
      },
      {
        key: "createdAt",
        name: "Created",
        fieldName: "createdAt",
        minWidth: 80,
        maxWidth: 100,
        isResizable: false,
      },
      {
        key: "actions",
        name: "",
        minWidth: 32,
        maxWidth: 32,
        onRender: (item: ITemplateRow): JSX.Element => (
          <IconButton
            iconProps={{ iconName: "Delete" }}
            title="Delete template"
            ariaLabel={`Delete ${item.name}`}
            styles={{ root: { color: "#a4262c" } }}
            onClick={(e): void => {
              e.stopPropagation();
              handleDelete(item.id); // eslint-disable-line @typescript-eslint/no-floating-promises
            }}
          />
        ),
      },
    ],
    [handleDelete],
  );

  // Selection handler — apply on row click
  const selection = React.useMemo(
    () =>
      new Selection({
        onSelectionChanged: (): void => {
          const selected = selection.getSelection() as ITemplateRow[];
          if (selected.length > 0 && selected[0]._template) {
            onApply(selected[0]._template);
          }
        },
      }),
    [onApply],
  );

  return (
    <Dialog
      hidden={!isOpen}
      onDismiss={onDismiss}
      dialogContentProps={{
        type: DialogType.normal,
        title: "Apply Budget Template",
        subText: templates.length > 0
          ? "Select a template to pre-fill line items."
          : undefined,
      }}
      modalProps={{ isBlocking: false }}
      minWidth={520}
    >
      {error && (
        <MessageBar
          messageBarType={MessageBarType.error}
          onDismiss={(): void => setError(undefined)}
          dismissButtonAriaLabel="Close"
        >
          {error}
        </MessageBar>
      )}

      {isLoading ? (
        <Spinner size={SpinnerSize.medium} label="Loading templates…" />
      ) : templates.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "24px 0",
            color: "#605e5c",
          }}
        >
          <Icon
            iconName="PageAdd"
            style={{ fontSize: 28, marginBottom: 8, display: "block" }}
          />
          <Text variant="medium">No saved templates yet.</Text>
          <Text
            variant="small"
            block
            style={{ color: "#a19f9d", marginTop: 4 }}
          >
            Create a template by clicking &quot;Save as Template&quot; in the
            budget editor.
          </Text>
        </div>
      ) : (
        <DetailsList
          items={rows}
          columns={columns}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.single}
          selection={selection}
          isHeaderVisible={true}
          compact
        />
      )}

      <DialogFooter>
        <DefaultButton text="Cancel" onClick={onDismiss} />
      </DialogFooter>
    </Dialog>
  );
};
