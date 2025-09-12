// src/components/PhaserGame.tsx
import { useEffect, useRef } from "react";
import Phaser from "phaser";

interface PhaserGameProps {
  gameId: string | number;
  width?: number;
  height?: number;
}

const FALLBACK_BASE64 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABH0lEQVR4nO3TsQ0AIAgFUPp/52tLhAg7FDI0wYXJzGHDJZlBHwAAAAAAAAAAAAAAAAC8BIM93t9cPHy6R38JD+wxTNsL9yEEdMMPMTDWjGHmQQ0AAAAAAAAAAAAAAAAA7oGqtxCNf14f5QAAAABJRU5ErkJggg==";

export default function PhaserGame({
  gameId,
  width = 800,
  height = 600,
}: PhaserGameProps) {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    let phaserGame: Phaser.Game | null = null;

    async function init() {
      try {
        const idStr =
          gameId === undefined || gameId === null ? "" : String(gameId).trim();
        if (!idStr || idStr.toLowerCase() === "nan") {
          throw new Error(`Invalid game id: ${String(gameId)}`);
        }

        const API_ROOT =
          (import.meta as any).env?.VITE_API_URL || "http://localhost:5001";
        const url = `${API_ROOT.replace(/\/$/, "")}/api/v1/games/${encodeURIComponent(
          idStr
        )}`;

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${
              localStorage.getItem("access_token") || ""
            }`,
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Failed to load game: ${res.status} ${text}`);
        }

        const body = await res.json();
        const data = body.data ?? body;
        const game_data = data?.game_data ?? {};
        let sprite_data: any = data?.sprite_data ?? {};
        if (typeof sprite_data === "string") {
          try {
            sprite_data = JSON.parse(sprite_data);
          } catch {
            sprite_data = { frames: {} };
          }
        }
        const gameConfig = game_data?.gameConfig ?? {
          width,
          height,
          backgroundColor: "#87CEEB",
          physics: { gravity: 500, moveSpeed: 200, jumpForce: -300 },
        };

        const frames: Record<string, string[]> = sprite_data?.frames ?? {};
        const fps: number = Number(sprite_data?.fps ?? 6) || 6;
        const gameType: string = (game_data?.gameType ??
          game_data?.game_type ??
          "Platformer Adventure") as string;

        console.log("Loaded game", idStr, {
          gameType,
          framesKeys: Object.keys(frames),
        });

        class MainScene extends Phaser.Scene {
          expectedFrameKeys: Record<string, string[]> = {};
          availableFrames: Record<string, string[]> = {};
          player: any = null;
          cursors: any = null;
          platforms: any[] = [];
          collectibles: any[] = [];
          lap = 0;
          checkpointsPassed = new Set<number>();

          constructor() {
            super({ key: "MainScene" });
          }

          preload() {
            this.expectedFrameKeys = {};

            Object.entries(frames).forEach(([k, list]) => {
              (list || []).forEach((frameData: string, i: number) => {
                const key = `${k}_${i}`;
                this.expectedFrameKeys[k] = this.expectedFrameKeys[k] || [];
                this.expectedFrameKeys[k].push(key);

                if (!frameData) return;
                let src = frameData;
                if (!src.startsWith("data:image/")) {
                  src = `data:image/png;base64,${src}`;
                }

                try {
                  (this.textures as any).addBase64(key, src);
                } catch (err) {
                  console.warn("addBase64 failed for key", key, err);
                }
              });
            });

            if (!this.textures.exists("placeholder_sprite")) {
              const g = this.make.graphics({ x: 0, y: 0, add: false });
              g.fillStyle(0x222222, 1);
              g.fillRect(0, 0, 64, 64);
              g.fillStyle(0xffffff, 1);
              g.fillRect(8, 8, 48, 48);
              g.generateTexture("placeholder_sprite", 64, 64);
            }
          }

          create() {
            this.availableFrames = {};
            Object.keys(this.expectedFrameKeys).forEach((animKey) => {
              this.availableFrames[animKey] = this.expectedFrameKeys[
                animKey
              ].filter((k) => (this.textures as any).exists(k));
            });

            this.cursors = this.input.keyboard.createCursorKeys();

            // choose spawn sprite
            const chooseFirst = (keys: string[] | undefined) =>
              keys && keys.length ? keys[0] : null;
            const spawnKey =
              chooseFirst(this.availableFrames["idle"]) ||
              chooseFirst(this.availableFrames["walk"]) ||
              chooseFirst(this.availableFrames["drive"]) ||
              "placeholder_sprite";

            this.player = this.physics.add.sprite(width / 2, height / 2, spawnKey);
            this.player.setCollideWorldBounds(true);

            Object.entries(this.availableFrames).forEach(([animKey, keys]) => {
              if (keys.length > 1) {
                try {
                  this.anims.create({
                    key: animKey,
                    frames: keys.map((k) => ({ key: k })),
                    frameRate: fps,
                    repeat: -1,
                  });
                } catch {}
              }
            });

            if (this.availableFrames["idle"]?.length) {
              try {
                this.player.anims.play("idle");
              } catch {}
            }

            // Basic fallback environment
            this.add.rectangle(width / 2, height / 2, width, height, 0x87ceeb);
          }

          update() {
            if (!this.player) return;
            const gType = gameType.toLowerCase();

            if (gType.includes("platformer") || gType.includes("pet")) {
              const moveSpeed = gameConfig.physics?.moveSpeed ?? 200;
              const jumpForce = gameConfig.physics?.jumpForce ?? -300;
              this.player.setVelocityX(0);

              if (this.cursors.left.isDown) {
                this.player.setVelocityX(-moveSpeed);
                this.player.flipX = true;
                this.player.anims.play("walk", true);
              } else if (this.cursors.right.isDown) {
                this.player.setVelocityX(moveSpeed);
                this.player.flipX = false;
                this.player.anims.play("walk", true);
              } else {
                this.player.anims.play("idle", true);
              }

              if (
                this.cursors.space.isDown &&
                (this.player.body as any).blocked?.down
              ) {
                this.player.setVelocityY(jumpForce);
              }
            } else if (gType.includes("speed racer")) {
              const accel = gameConfig.physics?.accel ?? 300;
              const maxSpeed = gameConfig.physics?.maxSpeed ?? 400;
              const turnRate = gameConfig.physics?.turnRate ?? 150;

              if (this.cursors.up.isDown) {
                this.physics.velocityFromRotation(
                  this.player.rotation,
                  accel,
                  this.player.body.acceleration
                );
              } else {
                this.player.setAcceleration(0);
              }

              if (this.cursors.left.isDown) {
                this.player.setAngularVelocity(-turnRate);
              } else if (this.cursors.right.isDown) {
                this.player.setAngularVelocity(turnRate);
              } else {
                this.player.setAngularVelocity(0);
              }

              if (this.cursors.down.isDown) {
                this.player.setVelocity(
                  this.player.body.velocity.x * 0.95,
                  this.player.body.velocity.y * 0.95
                );
              }

              this.physics.world.wrap(this.player, 16);
            } else if (gType.includes("battle arena")) {
              const moveSpeed = gameConfig.physics?.moveSpeed ?? 250;
              this.player.setVelocity(0);

              if (this.cursors.left.isDown) this.player.setVelocityX(-moveSpeed);
              if (this.cursors.right.isDown) this.player.setVelocityX(moveSpeed);
              if (this.cursors.up.isDown) this.player.setVelocityY(-moveSpeed);
              if (this.cursors.down.isDown) this.player.setVelocityY(moveSpeed);

              if (this.input.keyboard.checkDown(this.cursors.space, 250)) {
                this.player.anims.play("attack", true);
              }
            }
          }
        }

        phaserGame = new Phaser.Game({
          type: Phaser.AUTO,
          width: gameConfig.width ?? width,
          height: gameConfig.height ?? height,
          parent: "game-container",
          backgroundColor: gameConfig.backgroundColor ?? "#000000",
          physics: {
            default: "arcade",
            arcade: {
              gravity: {
                x: 0,
                y:
                  gameType.toLowerCase().includes("speed racer") ||
                  gameType.toLowerCase().includes("battle arena")
                    ? 0
                    : gameConfig.physics?.gravity ?? 500,
              },
              debug: false,
            },
          },
          scene: MainScene,
        });

        gameRef.current = phaserGame;
      } catch (err: any) {
        console.error("Phaser init error:", err);
      }
    }

    if (!gameRef.current) init();

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [gameId, width, height]);

  return <div id="game-container" style={{ width, height }} />;
}
