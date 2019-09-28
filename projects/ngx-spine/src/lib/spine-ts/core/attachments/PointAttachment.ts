/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated May 1, 2019. Replaces all prior versions.
 *
 * Copyright (c) 2013-2019, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS
 * INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
import { MathUtils, Color, Vector2 } from "../Utils";
import { VertexAttachment, Attachment } from "./Attachment";
import { Bone } from "../Bone";

export class PointAttachment extends VertexAttachment {
  x: number;
  y: number;
  rotation: number;
  color = new Color(0.38, 0.94, 0, 1);

  constructor(name: string) {
    super(name);
  }

  computeWorldPosition(bone: Bone, point: Vector2) {
    point.x = this.x * bone.a + this.y * bone.b + bone.worldX;
    point.y = this.x * bone.c + this.y * bone.d + bone.worldY;
    return point;
  }

  computeWorldRotation(bone: Bone) {
    let cos = MathUtils.cosDeg(this.rotation),
      sin = MathUtils.sinDeg(this.rotation);
    let x = cos * bone.a + sin * bone.b;
    let y = cos * bone.c + sin * bone.d;
    return Math.atan2(y, x) * MathUtils.radDeg;
  }

  copy(): Attachment {
    let copy = new PointAttachment(name);
    copy.x = this.x;
    copy.y = this.y;
    copy.rotation = this.rotation;
    copy.color.setFromColor(this.color);
    return copy;
  }
}
