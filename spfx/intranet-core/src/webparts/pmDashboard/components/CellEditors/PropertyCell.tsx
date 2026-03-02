/**
 * PropertyCell – Property address cell with optional link.
 *
 * Shows the property address as editable text. If the row has a
 * propertyUrl, clicking the link icon opens it in a new tab.
 */

import * as React from "react";
import { TextCell } from "./TextCell";
import styles from "../PmDashboard.module.scss";

export interface IPropertyCellProps {
  value: string;
  propertyUrl?: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export const PropertyCell: React.FC<IPropertyCellProps> = ({
  value,
  propertyUrl,
  onChange,
  readOnly,
}) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <TextCell
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        placeholder="Property address"
      />
      {propertyUrl && (
        <a
          href={propertyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.propertyLink}
          title="Open in PropertyMe"
          onClick={(e) => e.stopPropagation()}
        >
          ↗
        </a>
      )}
    </div>
  );
};
