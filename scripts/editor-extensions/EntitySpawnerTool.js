import * as Server from "@minecraft/server";
import * as Editor from "@minecraft/server-editor";
import { Color } from "../color/index";
/**
 * @param {import("@minecraft/server-editor").IPlayerUISession} uiSession
 */
export default (uiSession) => {
    const tool = uiSession.toolRail.addTool(
        {
            displayString: "Entity Spawner (CTRL + E)",
            tooltip: "Left mouse click or drag-to-spawn",
            icon: "pack://textures/editor/entity.png?filtering=point",
        },
    );

    const previewSelection = uiSession.extensionContext.selectionManager.create();
    previewSelection.visible = true;
    previewSelection.setOutlineColor(new Color(0, 1, 0, 0.2));
    previewSelection.setFillColor(new Color(0, 1, 0, 0.1));
    
    uiSession.scratchStorage = {
        currentCursorState: {
            outlineColor: new Color(0, 1, 0, 1),
            controlMode: Editor.CursorControlMode.KeyboardAndMouse,
            targetMode: Editor.CursorTargetMode.Face,
            visible: true,
            fixedModeDistance: 5
        },
        previewSelection,
    };
    
    tool.onModalToolActivation.subscribe(
        eventData => {
            if (eventData.isActiveTool)
                uiSession.extensionContext.cursor.setProperties(uiSession.scratchStorage.currentCursorState);
        },
    );
    
    uiSession.inputManager.registerKeyBinding(
        Editor.EditorInputContext.GlobalToolMode,
        uiSession.actionManager.createAction(
            {
                actionType: Editor.ActionTypes.NoArgsAction,
                onExecute: () => {
                    uiSession.toolRail.setSelectedOptionId(tool.id, true);
                },
            },
        ),
        Editor.KeyboardKey.KEY_E,
        Editor.InputModifier.Control,
    );
    
    const pane = uiSession.createPropertyPane(
        {
            titleAltText: "Entity Spawner",
            width: 40,
        },
    );
    
    const settings = Editor.createPaneBindingObject(
        pane,
        {
            nameTag: "",
            entityType: Server.MinecraftEntityTypes.creeper.id,
        },
    );

    pane.addString(
        settings,
        "nameTag",
        {
            titleAltText: "Name Tag",
        },
    );
    
    pane.addDropdown(
        settings,
        "entityType",
        {
            titleAltText: "Entity Type",
            dropdownItems: [...Server.EntityTypes.getAll()].map(({ id }) => id).sort().map(
                (id) => (
                    {
                        value: id,
                        displayAltText: id,
                        displayStringId: "entity." + id.replace("minecraft:", "") + ".name",
                    }
                ),
            ),
        },
    );
    
    tool.bindPropertyPane(pane);
    
    const onExecuteBrush = () => {
        if (!uiSession.scratchStorage?.previewSelection) {
            console.error('Entity Spawner storage was not initialized.');
            return;
        };
        
        const previewSelection = uiSession.scratchStorage.previewSelection;
        const player = uiSession.extensionContext.player;
        const targetBlock = player.dimension.getBlock(uiSession.extensionContext.cursor.getPosition());
        if (!targetBlock) return;
        const location = targetBlock.location;
        const from = {
            x: location.x,
            y: location.y,
            z: location.z,
        };
        const to = { x: from.x, y: from.y, z: from.z };
        const blockVolume = { from, to };
        if (uiSession.scratchStorage.lastVolumePlaced && Server.BoundingBoxUtils.equals(uiSession.scratchStorage.lastVolumePlaced, Server.BlockVolumeUtils.getBoundingBox(blockVolume))) return;

        previewSelection.pushVolume(
            {
                action: Server.CompoundBlockVolumeAction.Add,
                volume: blockVolume
            }
        );
        uiSession.scratchStorage.lastVolumePlaced = Server.BlockVolumeUtils.getBoundingBox(blockVolume);
    };
    
    tool.registerMouseButtonBinding(
        uiSession.actionManager.createAction(
            {
                actionType: Editor.ActionTypes.MouseRayCastAction,
                onExecute: async (mouseRay, mouseProps) => {
                    if (mouseProps.mouseAction == Editor.MouseActionType.LeftButton) {
                        if (mouseProps.inputType == Editor.MouseInputType.ButtonDown) {
                            uiSession.scratchStorage.previewSelection.clear();
                            onExecuteBrush();
                        } else if (mouseProps.inputType == Editor.MouseInputType.ButtonUp) {
                            await Editor.executeLargeOperation(uiSession.scratchStorage.previewSelection, blockLocation => {
                                const player = uiSession.extensionContext.player;
                                const targetBlock = player.dimension.getBlock(blockLocation);
                                
                                if(targetBlock) {
                                    const entity = player.dimension.spawnEntity(
                                        settings.entityType,
                                        {
                                            x: targetBlock.x + 0.5,
                                            y: targetBlock.y,
                                            z: targetBlock.z + 0.5,
                                        },
                                    );

                                    entity.nameTag = settings.nameTag;
                                };
                            }).catch(() => {
                                uiSession.extensionContext.transactionManager.commitOpenTransaction();
                                uiSession.scratchStorage?.previewSelection.clear();
                            }).then(() => {
                                uiSession.extensionContext.transactionManager.commitOpenTransaction();
                                uiSession.scratchStorage?.previewSelection.clear();
                            });
                        };
                    };
                },
            },
        ),
    );
    
    tool.registerMouseDragBinding(
        uiSession.actionManager.createAction(
            {
                actionType: Editor.ActionTypes.MouseRayCastAction,
                onExecute: (mouseRay, mouseProps) => {
                    if (mouseProps.inputType === Editor.MouseInputType.Drag) onExecuteBrush();
                },
            },
        ),
    );
};